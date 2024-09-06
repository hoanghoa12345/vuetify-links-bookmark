// Composables
import checkAuth from "@/middlewares/checkAuth";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "",
        name: "Home",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/Home.vue"),
      },
      {
        path: "/info",
        name: "WebsiteInfo",
        component: () =>
          import(/* webpackChunkName: "info" */ "@/views/Info.vue"),
      },
      {
        path: "/parallax",
        name: "index.parallax",
        component: () =>
          import(/* wepackChunkName: "parallax" */ "@/views/Parallax.vue"),
      },
      {
        path: "/old-version",
        name: "index.old_version",
        component: () =>
          import(/* wepackChunkName: "old_version" */ "@/views/OldVersion.vue"),
      },
    ],
  },
  {
    path: "/auth",
    component: () =>
      import(/* webpackChunkName: "auth" */ "@/layouts/auth/Auth.vue"),
    children: [
      {
        path: "login",
        name: "auth.login",
        component: () =>
          import(/* webpackChunkName: "info" */ "@/views/Login.vue"),
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () =>
      import(/* wepackChunkName: "notfound" */ "@/views/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  checkAuth(to, from, next);
});

export default router;
