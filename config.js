const config = {
  title: "virtualraven",
  env:   process.env.NODE_ENV || "production",
  ports: {
    http:  process.env.HTTP || 3666,
    https: process.env.HTTPS || 3443
  }
}
module.exports = config