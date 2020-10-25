import type { React } from '../deps.ts';
// eslint-disable-next-line no-duplicate-imports
import { fs, path, colors } from '../deps.ts';

import {
  pick,
  unique,
  sortByInsert,
  importDefault,
  logger,
  walk,
  getPagicConfigPath,
  importPlugin,
  importTheme,
  serve
} from './utils/mod.ts';
import type { PagePropsSidebar, PagicConfigSidebar } from './plugins/sidebar.tsx';
import type { GaProps } from './plugins/ga_component.tsx';
import type { GitalkProps } from './plugins/gitalk_component.tsx';

// #region types
export interface PagicConfig {
  // base
  srcDir: string;
  outDir: string;
  include?: string[];
  exclude?: string[];
  root: string;
  theme: string;
  plugins: string[];
  watch: boolean;
  serve: boolean;
  port: number;

  // theme config
  title?: string;
  description?: string;
  head?: React.ReactElement | null;
  github?: string;
  tocAd?: React.ReactElement;
  tools?: {
    editOnGithub: boolean;
    backToTop: boolean;
  };

  // plugins
  nav?: {
    text: string;
    link: string;
    target?: '_blank' | string;
    popover?: React.ReactElement;
    align?: 'left' | 'right';
  }[];
  sidebar?: PagicConfigSidebar;
  md?: {
    anchorLevel?: (1 | 2 | 3 | 4 | 5 | 6)[];
    tocLevel?: (1 | 2 | 3 | 4 | 5 | 6)[];
  };
  blog?: {
    path: string;
  };
  ga?: GaProps;
  gitalk?: GitalkProps;
  i18n?: {
    languages: { code: string; name: string; path: string }[];
    overrides?: Record<string, any>;
    resources?: Record<string, { translation: Record<string, string> }>;
  };

  [key: string]: any;
}

export interface PagicThemeConfig {
  files: [];
}

export interface PagicPlugin {
  name: string;
  insert?: string;
  fn: (ctx: Pagic) => Promise<void>;
}

export type PagicLayout<T = Record<string, any>> = React.FC<PageProps & T>;

export interface PageProps {
  // md
  title: string;
  content: React.ReactElement | null;
  contentTitle?: React.ReactElement;
  contentBody?: React.ReactElement;
  contentHasKatex?: boolean;
  toc?: React.ReactElement | null;
  date?: Date | string;
  updated?: Date | string | null;
  author?: string;
  contributors?: string[];

  // init
  config: PagicConfig;
  pagePath: string;
  layoutPath: string;
  outputPath: string;
  head: React.ReactElement | null;
  script: React.ReactElement | null;

  // script
  loading?: boolean;

  // other plugins
  sidebar?: PagePropsSidebar;
  prev?: PagePropsSidebar[0];
  next?: PagePropsSidebar[0];
  blog?: {
    isPost: boolean;
    isPosts: boolean;
    posts: {
      pagePath: string;
      title: string;
      link: string;
      date: Date | string;
      updated: Date | string;
    }[];
  };
  ga?: React.ReactElement;
  gitalk?: React.ReactElement;
  language?: { code: string; name: string; path: string };

  [key: string]: any;
}
// #endregion

export default class Pagic {
  // #region properties
  public static defaultConfig: PagicConfig = {
    srcDir: '.',
    outDir: 'dist',
    include: undefined,
    exclude: [
      // Dot files
      '**/.*',
      // Node common files
      '**/package.json',
      '**/package-lock.json',
      '**/node_modules',
      'pagic.config.ts',
      'pagic.config.tsx',
      // https://docs.npmjs.com/using-npm/developers.html#keeping-files-out-of-your-package
      '**/config.gypi',
      '**/CVS',
      '**/npm-debug.log'

      // ${config.outDir} will be added later
    ],
    root: '/',
    theme: 'default',
    plugins: ['clean', 'init', 'md', 'tsx', 'script', 'layout', 'out'],
    watch: false,
    serve: false,
    port: 8000
  };
  // foo.md
  public static REGEXP_PAGE = /[\/\\][^_][^\/\\]*\.(md|tsx)$/;
  // /_layout.tsx /_sidebar.tsx
  public static REGEXP_LAYOUT = /[\/\\]_[^\/\\]+\.tsx$/;

  // @ts-ignore
  public pagicConfigPath: string;
  // @ts-ignore
  public config: PagicConfig = {};

  /** Pages that need to be build */
  public pagePaths: string[] = [];
  public layoutPaths: string[] = [];
  public staticPaths: string[] = [];
  /** Files that need to be write */
  public writeFiles: Record<string, string> = {};
  /** A map stored all pageProps */
  public pagePropsMap: Record<string, PageProps> = {};
  public rebuilding = true;

  public projectConfig: Partial<PagicConfig> = {};
  private runtimeConfig: Partial<PagicConfig> = {};

  private changedPaths: string[] = [];
  private timeoutHandler: number | undefined = undefined;
  // #endregion

  public constructor(config: Partial<PagicConfig> = {}) {
    this.runtimeConfig = config;
  }

  public async build() {
    await this.rebuild();
    if (this.config.serve) {
      this.serve();
    }
    if (this.config.watch) {
      this.watch();
    }
  }

  public async genMod() {
    this.config = Pagic.defaultConfig;
    if (this.config.exclude) {
      this.config.exclude.push('mod.ts');
    } else {
      this.config.exclude = [ 'mod.ts' ];
    }

    await this.initPaths();

    await Deno.writeTextFile('./mod.ts', 'export default {\n' + '  files: [\n');
    for (const modFile of this.staticPaths.concat(this.layoutPaths)) {
        await Deno.writeTextFile('./mod.ts', `    '${modFile}',` + '\n', { append: true });
    }
    await Deno.writeTextFile('./mod.ts', '  ]\n' + '}\n', { append: true });
  }

  public async genConf(confFileName: string) {
    /*
     * See https://stackoverflow.com/questions/11233498/json-stringify-without-quotes-on-properties
     * Since we're passing Pagic.defaultConfig, we shouldn't have to worry about extreme cases.
     */
    let configStr = JSON.stringify(Pagic.defaultConfig, null, 2).replace(/"([^"]+)":/g, '$1:');
    await Deno.writeTextFile(confFileName, 'export default ');
    await Deno.writeTextFile(confFileName, configStr, { append: true });
    await Deno.writeTextFile(confFileName, ';\n', { append: true });
  }

  public getConfig(pagePath?: string) {
    if (typeof pagePath === 'undefined') {
      return this.config;
    }
    return this.pagePropsMap[pagePath].config;
  }
  
  private async rebuild() {
    this.rebuilding = true;
    this.pagePropsMap = {};
    this.writeFiles = {};

    await this.initConfig();
    await this.initPaths();
    await this.runPlugins();
  }

  /** Deep merge defaultConfig, projectConfig and runtimeConfig, then sort plugins */
  private async initConfig() {
    this.pagicConfigPath = await getPagicConfigPath();
    this.projectConfig = await importDefault(this.pagicConfigPath, {
      reload: true
    });
    let config = {
      ...Pagic.defaultConfig,
      ...this.projectConfig,
      ...this.runtimeConfig
    };
    config.exclude = unique([
      ...(Pagic.defaultConfig.exclude ?? []),
      ...(this.projectConfig.exclude ?? []),
      ...(this.runtimeConfig.exclude ?? []),
      config.outDir
    ]);
    config.plugins = unique([
      ...Pagic.defaultConfig.plugins,
      ...(this.projectConfig.plugins ?? []),
      ...(this.runtimeConfig.plugins ?? [])
    ]);
    this.config = config;
  }

  private async serve() {
    serve({
      serveDir: this.config.outDir,
      root: this.config.root,
      port: this.config.port
    });
    logger.success(
      'Serve',
      colors.underline(this.config.outDir),
      `on http://127.0.0.1:${this.config.port}${this.config.root}`
    );
  }

  private async watch() {
    logger.success('Watch', colors.underline(this.config.srcDir));
    const watcher = Deno.watchFs([this.config.srcDir, this.pagicConfigPath]);
    for await (const event of watcher) {
      // pagic.config.ts modified, rebuild
      if (event.kind === 'modify' && event.paths.includes(this.pagicConfigPath)) {
        clearTimeout(this.timeoutHandler);
        this.timeoutHandler = setTimeout(async () => {
          this.rebuild();
        }, 100);
        continue;
      }
      let eventPaths = event.paths.map((eventPath) => path.relative(this.config.srcDir, eventPath));
      this.config.include?.forEach((glob) => {
        eventPaths = eventPaths.filter(
          (eventPath) => path.globToRegExp(glob).test(eventPath) || path.globToRegExp(`${glob}/**`).test(eventPath)
        );
      });
      this.config.exclude?.forEach((glob) => {
        eventPaths = eventPaths.filter(
          (eventPath) => !path.globToRegExp(glob).test(eventPath) && !path.globToRegExp(`${glob}/**`).test(eventPath)
        );
      });
      this.handleFileChange(eventPaths);
    }
  }

  private async handleFileChange(filePaths: string[]) {
    if (filePaths.length === 0) return;
    this.changedPaths = unique([...this.changedPaths, ...filePaths]);
    clearTimeout(this.timeoutHandler);
    this.timeoutHandler = setTimeout(async () => {
      this.rebuilding = false;
      this.pagePaths = [];
      this.staticPaths = [];
      for (const changedPath of this.changedPaths) {
        const fullChangedPath = path.resolve(this.config.srcDir, changedPath);
        if (!fs.existsSync(fullChangedPath)) {
          logger.warn(`${changedPath} removed, start rebuild`);
          this.rebuilding = true;
          break;
        } else if (Deno.statSync(fullChangedPath).isDirectory) {
          logger.warn(`Directory ${colors.underline(changedPath)} changed, start rebuild`);
          this.rebuilding = true;
          break;
        } else if (Pagic.REGEXP_LAYOUT.test(fullChangedPath)) {
          logger.warn(`Layout ${changedPath} changed, start rebuild`);
          this.rebuilding = true;
          break;
        } else if (Pagic.REGEXP_PAGE.test(fullChangedPath)) {
          this.pagePaths.push(changedPath);
        } else {
          this.staticPaths.push(changedPath);
        }
      }
      if (this.rebuilding) {
        await this.rebuild();
      } else {
        await this.runPlugins();
      }
      this.changedPaths = [];
    }, 100);
  }

  private async initPaths() {
    const { files: themeFiles } = await importTheme(this.config.theme);

    this.pagePaths = await walk(this.config.srcDir, {
      ...pick(this.config, ['include', 'exclude']),
      match: [Pagic.REGEXP_PAGE]
    });
    this.layoutPaths = unique([
      ...(await walk(this.config.srcDir, {
        ...pick(this.config, ['include', 'exclude']),
        match: [Pagic.REGEXP_LAYOUT]
      })),
      ...themeFiles.filter((filename) => Pagic.REGEXP_LAYOUT.test(`/${filename}`))
    ]);
    this.staticPaths = unique([
      ...(await walk(this.config.srcDir, {
        ...pick(this.config, ['include', 'exclude']),
        skip: [Pagic.REGEXP_PAGE, Pagic.REGEXP_LAYOUT]
      })),
      ...themeFiles.filter(
        (filename) => !Pagic.REGEXP_PAGE.test(`/${filename}`) && !Pagic.REGEXP_LAYOUT.test(`/${filename}`)
      )
    ]);
  }

  private async runPlugins() {
    if (this.pagePaths.length === 0 && this.staticPaths.length === 0) return;

    let sortedPlugins: PagicPlugin[] = [];
    for (let pluginName of this.config.plugins) {
      if (pluginName.startsWith('-')) {
        continue;
      }
      let plugin = await importPlugin(pluginName);
      sortedPlugins.push(plugin);
    }
    sortedPlugins = sortByInsert(sortedPlugins);
    const removedPlugins = this.config.plugins.filter((pluginName) => pluginName.startsWith('-'));
    sortedPlugins = sortedPlugins.filter((plugin) => !removedPlugins.includes(`-${plugin.name}`));

    for (let plugin of sortedPlugins) {
      logger.success('Plugin', plugin.name, 'start');
      await plugin.fn(this);
    }
  }
}
