function Org(name, team, permission) {
  this.name = name;
  this.team = team;
  this.permission = permission;
};

module.exports = {
  token: 'your-github-token-here',
  orgs: [
    new Org('foo', 'bar')
  ]
};
