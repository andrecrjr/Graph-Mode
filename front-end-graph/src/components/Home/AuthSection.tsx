import { Session } from "next-auth";
import AuthButton from "../Buttons";
import { SearchByUrl } from "../SearchInput/SearchByUrl";

export function AuthSection({ data }: { data: Session | null }) {
  return (
    <section className="w-full mt-auto flex flex-col mb-4 items-center justify-center">
      {!!data ? (
        <>
          <SearchByUrl />
          <AuthButton />
        </>
      ) : (
        <>
          <p className="font-bold bg-yellow-200">
            You need to log in to our Notion Integration to continue.
          </p>
          <AuthButton />
        </>
      )}
    </section>
  );
}
