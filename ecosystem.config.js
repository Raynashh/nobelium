module.exports = {
  apps: [
    {
      name: "nobelium",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
