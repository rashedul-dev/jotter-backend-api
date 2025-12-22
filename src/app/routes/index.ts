import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { FileRoutes } from "../modules/files/file.route";
import { FolderRoutes } from "../modules/folders/folder.route";
import { PinRoutes } from "../modules/pin/pin.route";
import { SearchRoutes } from "../modules/search/search.route";
import { CalendarRoutes } from "../modules/calendar/calendar.route";
import { SupportRoutes } from "../modules/support/support.route";
import { StorageRoutes } from "../modules/storage/storage.route";
import { ActivityRoutes } from "../modules/activity/activity.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/files",
    route: FileRoutes,
  },
  {
    path: "/folders",
    route: FolderRoutes,
  },
  {
    path: "/pin",
    route: PinRoutes,
  },
  {
    path: "/search",
    route: SearchRoutes,
  },
  {
    path: "/calendar",
    route: CalendarRoutes,
  },
  {
    path: "/support",
    route: SupportRoutes,
  },
  {
    path: "/storage",
    route: StorageRoutes,
  },
  {
    path: "/activity",
    route: ActivityRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
