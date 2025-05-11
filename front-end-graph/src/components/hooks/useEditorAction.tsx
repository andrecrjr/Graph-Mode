import type { INotionPage } from "@/types/notionPage";
import { useEditorContext } from "../Context/EditorContext";
import { useGraphContextData } from "../Context/GraphContext";
import { fetchServer } from "../service/Notion";
import { useToast } from "@/components/hooks/use-toast";
import { createOrUpdateNode, isMock, saveStorage } from "../utils";
import { useUserSession } from "../Context/UserSessionContext";
import { ToastAction } from "../ui/toast";
import Link from "next/link";

export const useEditorActionPage = () => {
  const { toast } = useToast();
  const {
    state: {
      editorDocument,
      pageId,
      initialContentDocument,
      tempNodeChoiceEditorId,
      sidebarOpen,
    },
    editorDispatch,
  } = useEditorContext();

  const { dispatch } = useGraphContextData();
  const { session } = useUserSession();
  const userEmail = session?.user.person?.email;

  const createMockPage = (): INotionPage => ({
    id: `mock-id-${(Math.random() * 8000).toFixed(8)}`,
    properties: {
      title: {
        title: [
          {
            plain_text:
              editorDocument?.document.filter(
                (item) => item.type === "heading", //@ts-ignore
              )[0].content[0].text || "Mocked Page",
            //@ts-ignore
            annotations: {},
            type: "page",
          },
        ],
      },
    },
  });

  const savePageData = (data: INotionPage) => {
    if (
      editorDocument?.document &&
      editorDocument.document.length > 0 &&
      !!tempNodeChoiceEditorId
    ) {
      // Create or Update nodes in the graph using Editor, dispatch the action
      dispatch({
        type: "UPDATE_NODES",
        payload: createOrUpdateNode(tempNodeChoiceEditorId, data, pageId),
      });
      editorDocument.replaceBlocks(
        editorDocument.document,
        initialContentDocument,
      );
      toast({
        title: "Page created with success!",
        className: "bg-green-600 text-white",
      });
      editorDispatch({
        type: "OPEN_SIDEBAR",
        payload: { sidebarOpen: !sidebarOpen },
      });
    } else {
      toast({
        title: "Problem to get the save the selected page!",
        className: "bg-green-600 text-white",
      });
    }
  };

  const createOrUpdatePage = async () => {
    try {
      if (!editorDocument?.document || editorDocument.document.length === 0)
        return;

      let data: INotionPage;
      if (!isMock(pageId)) {
        data = await fetchServer<INotionPage>(
          `/translate/page?user=${userEmail}`,
          saveStorage.get("notionKey", true),
          {
            method: "POST",
            body: JSON.stringify({
              children: editorDocument.document,
              parentId: tempNodeChoiceEditorId || pageId,
              debug: false,
            }),
          },
        );
      } else {
        data = createMockPage();
      }

      savePageData(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      toast({
        title: "Error",
        description: `${errorMessage}`,
        action: errorMessage.includes("limit reached") ? (
          <Link href="/pricing" className="flex">
            <ToastAction
              altText="Premium"
              className="hover:opacity-65 hover:bg-primary"
            >
              Get unlimited notes
            </ToastAction>
          </Link>
        ) : undefined,
        className: "bg-red-500 text-white",
      });
    }
  };

  return { createOrUpdatePage, pageId };
};
