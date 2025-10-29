// Solo ejecutamos el scheduler en el servidor
if (typeof window === "undefined") {
  import("./scheduler").then(({ startJobScheduler }) => {
    startJobScheduler();
  });
}
