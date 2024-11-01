import { INotionPage } from "@/types/notionPage";
import { useEditorContext } from "../Context/EditorContext";
import { useGraphContextData } from "../Context/GraphContext";
import { fetchServer } from "../service/Notion";
import { useToast } from "@/components/hooks/use-toast";
import { createOrUpdateNode, isMock, saveStorage } from "../utils";

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
      dispatch({
        type: "UPDATE_NODES",
        payload: createOrUpdateNode(tempNodeChoiceEditorId, data, pageId),
      });
      editorDocument.replaceBlocks(
        editorDocument.document,
        initialContentDocument,
      );
      toast({
        title: `Page created with success!`,
        className: "bg-green-600 text-white",
      });
      editorDispatch({
        type: "OPEN_SIDEBAR",
        payload: { sidebarOpen: !sidebarOpen },
      });
    } else {
      toast({
        title: `Problem to get the save the selected page!`,
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
          "/translate/page",
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
      console.error(error);
      toast({
        title: `Error`,
        description: "Problem to create your new Page Node, please try again.",
        className: "bg-red-500 text-white",
      });
    }
  };

  return { createOrUpdatePage, pageId };
};
