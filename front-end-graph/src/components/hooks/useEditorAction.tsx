import { INotionPage } from "@/types/notionPage";
import { useEditorContext } from "../Context/EditorContext";
import { useGraphContextData } from "../Context/GraphContext";
import { fetchServer } from "../service/Notion";
import { useToast } from "@/components/hooks/use-toast";
import { createOrUpdateNode, isMock, mockIdPage, saveStorage } from "../utils";

export const useEditorActionPage = () => {
  const { toast } = useToast();
  const {
    state: {
      editorDocument,
      pageId,
      initialContentDocument,
      tempNodeChoiceEditorId,
    },
  } = useEditorContext();
  const { dispatch } = useGraphContextData();

  const createMockPage = (): INotionPage => ({
    id: `mock-id-${(Math.random() * 8000).toFixed(8)}`,
    properties: {
      title: {
        title: [
          {
            plain_text: "Mock example",
            //@ts-ignore
            annotations: {},
            type: "page",
          },
        ],
      },
    },
  });

  const savePageData = (data: INotionPage) => {
    if (editorDocument?.document && editorDocument.document.length > 0) {
      const nodeId =
        pageId === "mock" ? mockIdPage : tempNodeChoiceEditorId || pageId;
      dispatch({
        type: "UPDATE_NODES",
        payload: createOrUpdateNode(nodeId, data),
      });
      editorDocument.replaceBlocks(
        editorDocument.document,
        initialContentDocument,
      );
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

  return { createOrUpdatePage };
};
