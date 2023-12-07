import { useReducer } from "react";
import { Header } from "./Header";
import { Main } from "./Main";
import { authenticate, User } from "./api/authenticate";
import { authorize } from "./api/authorize";

type State = {
  user: undefined | User;
  permissions: undefined | string[];
  loading: boolean;
};
const initialState: State = {
  user: undefined,
  permissions: undefined,
  loading: false,
};

type Action =
  | {
      type: "authenticate";
    }
  | {
      type: "authenticated";
      user: User | undefined;
    }
  | {
      type: "unauthenticate";
    }
  | {
      type: "unauthenticated";
      user: undefined;
    }
  | {
      type: "authorize";
    }
  | {
      type: "authorized";
      permissions: string[];
    }
  | {
      type: "deauthorize";
    }
  | {
      type: "deauthorized";
      permissions: undefined;
    };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "unauthenticate":
      return { ...state, loading: true };
    case "unauthenticated":
      return { ...state, loading: false, user: undefined };
    case "authenticate":
      return { ...state, loading: true };
    case "authenticated":
      return { ...state, loading: false, user: action.user };
    case "authorize":
      return { ...state, loading: true };
    case "authorized":
      return {
        ...state,
        loading: false,
        permissions: action.permissions,
      };
    case "deauthorize":
      return { ...state, loading: true };
    case "deauthorized":
      return {
        ...state,
        loading: false,
        permissions: undefined,
      };
    default:
      return state;
  }
}

function App() {
  const [{ user, permissions, loading }, dispatch] = useReducer(
    reducer,
    initialState
  );

  async function handleSignInClick() {
    dispatch({ type: "authenticate" });
    const authenticatedUser = await authenticate();
    dispatch({
      type: "authenticated",
      user: authenticatedUser,
    });
    if (authenticatedUser !== undefined) {
      dispatch({ type: "authorize" });
      const authorizedPermissions = await authorize(authenticatedUser.id);
      dispatch({
        type: "authorized",
        permissions: authorizedPermissions,
      });
    }
  }

  async function handleSignOutClick() {
    dispatch({ type: "unauthenticate" });
    dispatch({
      type: "unauthenticated",
      user: undefined,
    });
    dispatch({ type: "deauthorize" });
    dispatch({
      type: "deauthorized",
      permissions: undefined,
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <Header
        user={user}
        onSignInClick={handleSignInClick}
        onSignOutClick={handleSignOutClick}
        loading={loading}
      />
      <Main user={user} permissions={permissions} />
    </div>
  );
}
export default App;
