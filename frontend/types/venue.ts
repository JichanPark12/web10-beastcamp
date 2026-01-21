export interface VenueBlock {
  id: number;
  blockDataName: string;
  rowSize: number;
  colSize: number;
}

export interface VenueDetail {
  id: number;
  venueName: string;
  blockMapUrl: string | null;
  blocks: VenueBlock[];
}

export interface BlockGrade {
  blockId: number;
  gradeId: number;
}

export interface Grade {
  id: number;
  name: string;
  price: number;
}
