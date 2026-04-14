import { useState } from "react";
import Auth from "./components/Auth";
import Chat from "./components/Chat"; // your chat component

function App() {
  const [user, setUser] = useState(localStorage.getItem("user"));

  return (
    <>
      {!user ? (
        <Auth setUser={(u) => {
          setUser(u);
          localStorage.setItem("user", u);
        }} />
      ) : (
        <Chat user={user} setUser={setUser} />
      )}
    </>
  );
}

export default App;