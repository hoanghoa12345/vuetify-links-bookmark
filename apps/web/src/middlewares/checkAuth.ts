import { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

export default function checkAuth(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  if (to.name !== "auth.login" && !localStorage.getItem("token")) {
    next({ name: "auth.login" });
  } else {
    next();
  }
}
