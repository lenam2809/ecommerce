export interface AboutDto {
    id?: string;
    hero: HeroSectionDto;
    values: ValueItemDto[];
    history: HistorySectionDto;
    team: TeamMemberDto[];
    cta: CtaSectionDto;
    isActive?: boolean;
}

export interface HeroSectionDto {
    title: string;
    description: string;
}

export interface ValueItemDto {
    title: string;
    description: string;
}

export interface HistorySectionDto {
    title: string;
    paragraphs: string[];
}

export interface TeamMemberDto {
    id?: string;
    name: string;
    role: string;
    imageUrl: string;
    bio: string;
}

export interface CtaSectionDto {
    title: string;
    description: string;
}