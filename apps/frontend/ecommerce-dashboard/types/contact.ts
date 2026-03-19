export interface ContactDto {
    id?: string;
    phone: ContactInfoDto;
    email: ContactInfoDto;
    office: ContactInfoDto;
    social: SocialLinkDto[];
    faqs: FaqItemDto[];
    isActive?: boolean // Thêm trường này

}

export interface ContactInfoDto {
    numberOrAddress: string;
    hoursOrDescription: string;
}

export interface SocialLinkDto {
    name: string;
    url: string;
}

export interface FaqItemDto {
    question: string;
    answer: string;
}