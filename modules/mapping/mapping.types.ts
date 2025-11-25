export enum EhrPlatform {
    KIPU = 'kipu',
    RELIATRAX = 'reliatrax',
    SIMPLEPRACTICE = 'simplepractice',
    BESTNOTES = 'bestnotes',
    EMED = 'emed',
    ALLEVA = 'alleva',
    ECW = 'ecw',
    ENSORA = 'ensora',
}

export type ElementInfo = {
    [key: number]: {
        elementType: string;
        elementPrimaryPath: string;
        elementAbsoluteXPath: string;
        elementLabel: string;
        elementPlaceholder: string;
        elementOptions: any;
    };
};

export enum MappingStage {
    ERROR = -1,
    IDLE = 0,
    GETTING_FORM = 1,
    FINDING_INPUTS = 2,
    EXTRACTING_ELEMENT_INFO = 3,
    DELETE_INPUTS = 4,
    GROUP_INPUTS = 5,
    COMPLETED = 6,
}