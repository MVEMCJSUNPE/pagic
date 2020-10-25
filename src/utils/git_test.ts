import { asserts } from '../../deps.ts';
import { omit } from './common.ts';

import { getGitLog } from './git.ts';

Deno.test('[getGitLog]', async () => {
  const gitLogResult = await getGitLog('test/fixtures/hello.tsx');
  asserts.assertEquals(gitLogResult, {
    author: 'xcatliu',
    contributors: ['xcatliu', 'somebody_for_test'],
    date: new Date('Sat Jul 11 20:13:54 2020 +0800'),
    updated: new Date('Thu Oct 22 23:05:45 2020 +0800')
  });
});

Deno.test('[getGitLog] only one commit', async () => {
  const gitLogResult = await getGitLog('test/fixtures/no_toc.md');
  asserts.assertEquals(gitLogResult, {
    author: 'xcatliu',
    contributors: ['xcatliu'],
    date: new Date('Sat Jul 11 20:13:54 2020 +0800'),
    updated: null
  });
});

Deno.test('[getGitLog] only one commit', async () => {
  const gitLogResult = await getGitLog('test/fixtures/not_exist.md');
  asserts.assertEquals(omit(gitLogResult, ['date']), {
    author: undefined,
    contributors: [],
    updated: null
  });
  asserts.assertEquals(gitLogResult.date.getDate(), new Date().getDate());
});
