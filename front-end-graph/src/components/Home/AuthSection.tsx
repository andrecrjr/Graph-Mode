import AuthButton from "../Buttons";
import SearchInput from "../SearchInput";
import { Session } from "@auth/core/types";

export async function AuthSection({ session }: { session: Session | null }) {
  return (
    <section className="w-full mt-auto flex flex-col mb-4 items-center justify-center dark:bg-gray-900">
      {!!session ? (
        <>
          <SearchInput />
        </>
      ) : (
        <AuthButton />
      )}
    </section>
  );
}
