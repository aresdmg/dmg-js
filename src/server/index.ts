import { userRoute } from "./routes/user";
import { router } from "./trpc";

export const appRouter = router({
    user: userRoute
});
export type AppRouter = typeof appRouter;
