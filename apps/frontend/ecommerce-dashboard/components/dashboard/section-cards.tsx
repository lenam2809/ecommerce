import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface CardData {
  title: string;
  value: string;
  description: string;
  trend: { value: string; direction: "up" | "down" };
  footer: { status: string; description: string };
}

interface SectionCardsProps {
  cards: CardData[];
  isLoading?: boolean;
}

function CardSkeleton() {
  return (
    <Card className="@container/card animate-pulse">
      <CardHeader>
        <CardDescription className="h-4 w-24 bg-muted rounded" />
        <CardTitle className="h-8 w-32 bg-muted rounded mt-2" />
        <CardAction>
          <Badge variant="outline" className="w-10 h-6 bg-muted" />
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="h-4 w-28 bg-muted rounded" />
        <div className="h-3 w-40 bg-muted rounded" />
      </CardFooter>
    </Card>
  );
}

export function SectionCards({ cards, isLoading = false }: SectionCardsProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs"
      aria-live="polite"
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <span className="sr-only">Đang tải thẻ KPI...</span>
          {Array.from({ length: 8 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </>
      ) : (
        cards.map((card) => {
          const TrendIcon = card.trend.direction === "up" ? IconTrendingUp : IconTrendingDown;
          return (
            <Card key={card.title} className="@container/card">
              <CardHeader>
                <CardDescription>{card.title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {card.value}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <TrendIcon />
                    {card.trend.value}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {card.footer.status} <TrendIcon className="size-4" />
                </div>
                <div className="text-muted-foreground">{card.footer.description}</div>
              </CardFooter>
            </Card>
          );
        })
      )}
    </div>
  );
}