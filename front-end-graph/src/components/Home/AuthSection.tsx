import { SearchByUrl } from "../SearchInput/SearchByUrl";
import { Session } from "@auth/core/types";

export async function AuthSection({ session }: { session: Session | null }) {
  return (
    <section className="w-full mt-auto flex flex-col mb-4 items-center justify-center">
      {!!session ? (
        <>
          <label>Input your Notion Page URL</label>
          <SearchByUrl />
        </>
      ) : (
        <section className="mx-4">
          <p className="font-bold mx-auto bg-yellow-200">
            Please log in to Notion to continue.
          </p>
        </section>
      )}
    </section>
  );
}
