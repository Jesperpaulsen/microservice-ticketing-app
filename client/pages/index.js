import buildClient from "../api/buildClient";

const index = ({ currentUser }) => {
  return <h1>You are {currentUser ? "" : "not"} signed in</h1>;
};

index.getInitialProps = async (context) => {
  const client = buildClient(context);

  const { data } = await client.get("/api/users/currentUser");

  return data;
};

export default index;
