import initServer from "./server";

initServer().then((app) => {
  const port = process.env.SERVER_PORT;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
