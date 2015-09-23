#!/usr/bin/env babel-node --stage 1

/**
 * Repo Updater Script:
 *
 * Unfortunately, GitHub doesn't have a nice interface for bulk adding
 * repos to a team. Because robots are allocated permissions via team
 * membership, we need this script to manually add repos to a team
 * and update permissions.
 **/

var config  = require('./config');
var Octo    = require('octokat');

/**
 * A list of objects containing basic info about team/organizations where
 * TaskClusterRobot belongs.
 * config {
 *  token: 'github-api-token',
 *  orgs: [
 *    {
 *      name: 'org name',
 *      team: 'TaskClusterRobot team name (in org)',
 *      permission: '(pull|push|admin)' // optional
 *    },
 *    ...
 *   ]
 * }
 **/
async function main(config) {
  try {
    let api = new Octo({token: config.token});
    for (let org of config.orgs) {
      console.log(`....updating ${org.name}....`);
      let orgAPI = await api.orgs(org.name);
      let teams = [await orgAPI.teams.fetch()];

      while(typeof(teams[teams.length-1].nextPage) == 'function') {
        teams.push(await teams[teams.length-1].nextPage());
      }

      //TODO: This sucks, access teams by name
      let team = undefined;
      for (let teamBlock of teams) {
        for (let t of teamBlock) {
          if (t.name == org.team) {
            team = t;
            break;
          }
        }
      }

      if (!team) {
        throw new Error(`team ${org.team} not found: abort`);
      }

      if (org.permission && (team.permission != org.permission)) {
        console.log(`Updating ${org.team} permission to: ${org.permission}...`);
        await team.update({name: team.name, permission: org.permission});
      }

      console.log('Enumerating repositories...');
      let repos = [await orgAPI.repos.fetch()];
      while(typeof(repos[repos.length-1].nextPage) == 'function') {
        repos.push(await repos[repos.length-1].nextPage());
      }

      let numOfRepos = 0;
      for (let repoBlock of repos) {
        console.log(`Adding repositories... ${numOfRepos + 1}-${numOfRepos + repoBlock.length}`);
        numOfRepos = numOfRepos + repoBlock.length;
        for (let repo of repoBlock) {
          await api.teams(team.id).repos(org.name, repo.name).add();
        }
      }
    }
  } catch(e) {
    console.log(e);
  }
};

main(config);
