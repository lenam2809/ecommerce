export interface Banner {
    id: string;
    title: string;
    description?: string | null;
    imageUrl: string;
    buttonText?: string | null;
    buttonLink?: string | null;
    isActive: boolean;
}