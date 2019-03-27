module.exports = app => {
    return async (ctx, next) => {
        await next();
        const nsp = ctx.app.io.of('/');
        // execute when disconnect.
        // /console.log('disconnection!=====',nsp);
    };
};
