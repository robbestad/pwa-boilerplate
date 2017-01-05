module.exports = function forceSSL(ctx) {
  return (ctx, next) => {

    // First, check if directly requested via https
    var protocol = ctx.protocol;
    if(protocol === "http"){
      ctx.response.redirect('https://localhost');
    }
  }
};
