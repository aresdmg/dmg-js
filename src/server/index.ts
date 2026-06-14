import { requestRouter } from "./routes/requests";
import { userRouter } from "./routes/user";
import { router } from "./trpc";

export const appRouter = router({
    user: userRouter,
    request: requestRouter
});
export type AppRouter = typeof appRouter;
