import initServer from "./server";

initServer().then(([server]) => {
  const port = process.env.SERVER_PORT;
  server.listen(port, () => {
    console.log(`>> Server is running on port ${port}`);
  });
});
