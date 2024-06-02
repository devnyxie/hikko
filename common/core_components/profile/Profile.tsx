import React from "react";
import module from "./Profile.module.css";

interface ProfileOptions {
  name?: string;
  title?: string;
  description?: string;
}

interface ProfileProps {
  options?: ProfileOptions;
}

function Profile({ options }: ProfileProps) {
  return (
    <div className={module.profile}>
      {options ? (
        <>
          {options.name && <h1>{options.name}</h1>}
          {options.title && <h2>{options.title}</h2>}
          {options.description && <p>{options.description}</p>}
        </>
      ) : (
        "No data provided for profile component :)"
      )}
    </div>
  );
}

export default Profile;
