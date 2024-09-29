import { Session } from "next-auth";
import AuthButton from "../Buttons";
import { SearchByUrl } from "../SearchInput/SearchByUrl";

export function AuthSection({ data }: { data: Session | null }) {
  return (
    <section className="w-full mt-auto flex flex-col mb-4 items-center justify-center">
      {!!data ? (
        <>
          <label>Input your Notion Page URL</label>
          <SearchByUrl />
        </>
      ) : (
        <section className="mx-2">
          <p className="font-bold mx-auto bg-yellow-200">
            You need to log in to our Notion Integration to continue.
          </p>
        </section>
      )}
    </section>
  );
}
