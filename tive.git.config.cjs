const { argv } = process
const desc =
  (argv.length > 4 && argv.slice(-1)[0]) ||
  `feat：new commit`

module.exports = {
  shell: [
    'git status',
    'git add .',
    `git commit -m "${desc}"`,
    // 'git checkout test',
    // 'git checkout master',
    'git pull origin master',
    'git push origin master',
    // 'git merge --no-ff -m "clue-now merge into master" test',
    // 'git pull origin feat/crm-v2.0',
    // 'git push origin feat/crm-v2.0',
    // 'npm run push',
  ],
}
