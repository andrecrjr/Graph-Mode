import { Session } from "next-auth";
import AuthButton from "../Buttons";
import { SearchByUrl } from "../SearchInput/SearchByUrl";
import { auth } from "../Auth";

export async function AuthSection() {
  const data = await auth();
  return (
    <section className="w-full mt-auto flex flex-col mb-4 items-center justify-center">
      {!!data ? (
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
