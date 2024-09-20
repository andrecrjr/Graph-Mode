export interface INotionPage {
  object: string;
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: CreatedBy;
  last_edited_by: LastEditedBy;
  cover: any;
  icon: any;
  parent: Parent;
  archived: boolean;
  in_trash: boolean;
  properties: Properties;
  url: string;
  public_url: any;
  request_id: string;
}

export interface CreatedBy {
  object: string;
  id: string;
}

export interface LastEditedBy {
  object: string;
  id: string;
}

export interface Parent {
  type: string;
  page_id: string;
}

export interface Properties {
  title: Title;
}

export interface Title {
  id: string;
  type: string;
  title: Title2[];
}

export interface Title2 {
  type: string;
  text: Text;
  annotations: Annotations;
  plain_text: string;
  href: any;
}

export interface Text {
  content: string;
  link: any;
}

export interface Annotations {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}
