import { useEffect } from "react";

const GoogleLogin = () => {
  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: '1054001837515-sj8nrurh5djljlaghguetc7hl9did3oe.apps.googleusercontent.com', // Paste the copied Client ID here
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-login"),
      { theme: "outline", size: "large" }
    );

    // Optionally show One Tap prompt
    // window.google.accounts.id.prompt();
  }, []);

  const handleCredentialResponse = (response) => {
    console.log("ID Token:", response.credential);

    // Send token to your backend
    fetch("/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential: response.credential }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend response:", data);
      });
  };

  return <div id="google-login"></div>;
};

export default GoogleLogin;
