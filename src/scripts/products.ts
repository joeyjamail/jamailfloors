// products.ts - Product catalog functionality
import type { Product } from '../utils/helpers';
import { PRODUCTS_DATA } from '../data/products';

interface ProductWithTags extends Product {
  tags: string[];
  widthLabel: string | null;
  widthValue: number | null;
  thicknessLabel: string | null;
  thicknessValue: number | null;
  wearLayerLabel: string | null;
  wearLayerValue: number | null;
}

interface WidthInfo {
  label: string;
  value: number;
}

interface NumericInfo {
  label: string;
  value: number;
}

function parseWidth(rawWidth: string | undefined): WidthInfo | null {
  if (!rawWidth) return null;
  const normalized = rawWidth.trim();

  // Handles values like 8-5/8"
  const fractionMatch = normalized.match(/^(\d+)\s*-\s*(\d+)\/(\d+)/);
  if (fractionMatch) {
    const whole = Number(fractionMatch[1]);
    const numerator = Number(fractionMatch[2]);
    const denominator = Number(fractionMatch[3]);
    if (denominator > 0) {
      const value = whole + numerator / denominator;
      return { label: `${whole}-${numerator}/${denominator}"`, value };
    }
  }

  // Handles values like 8.66" or 7.5"
  const decimalMatch = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!decimalMatch) return null;

  const value = Number(decimalMatch[1]);
  if (Number.isNaN(value)) return null;

  return { label: `${value}"`, value };
}

function parseThickness(rawThickness: string | undefined): NumericInfo | null {
  if (!rawThickness) return null;
  const normalized = rawThickness.trim();

  const fractionMatch = normalized.match(/^([0-9]+)\/([0-9]+)\"?$/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (denominator > 0) {
      return { label: `${numerator}/${denominator}"`, value: numerator / denominator };
    }
  }

  const decimalMatch = normalized.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!decimalMatch) return null;

  const value = Number(decimalMatch[1]);
  if (Number.isNaN(value)) return null;

  return { label: `${value}"`, value };
}

function parseWearLayer(rawWearLayer: string | undefined): NumericInfo | null {
  if (!rawWearLayer) return null;
  const match = rawWearLayer.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!match) return null;
  const value = Number(match[1]);
  if (Number.isNaN(value)) return null;
  return { label: `${value} mm`, value };
}

function parseWidthFromBoardSize(boardSize: string | undefined): WidthInfo | null {
  if (!boardSize) return null;

  const parts = boardSize
    .split(/\s*x\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return null;

  if (parts.length >= 2) {
    const first = parts[0].toLowerCase();
    const second = parts[1].toLowerCase();

    // When length appears as "Random Length", width is the opposite dimension.
    if (first.includes('random length')) {
      return parseWidth(parts[1]);
    }
    if (second.includes('random length')) {
      return parseWidth(parts[0]);
    }

    // Standard format: Length x Width x Thickness
    return parseWidth(parts[1]);
  }

  return parseWidth(parts[0]);
}

function parseThicknessFromBoardSize(boardSize: string | undefined): NumericInfo | null {
  if (!boardSize) return null;

  const parts = boardSize
    .split(/\s*x\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 3) {
    return parseThickness(parts[2]);
  }

  return null;
}

const BASE_PRODUCTS: ProductWithTags[] = [
  { id: 'avignon', name: 'Avignon', image: '/images/Products/avignon/avignon-european-oak-hardwood-floor-01.jpg', description: 'A crisp, cool white oak with frosty undertones that creates a fresh, Nordic-inspired atmosphere.', tags: ['light', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'amber-canyon', name: 'Amber Canyon', image: '/images/Products/amber-canyon/amber-canyon-oak-flooring-in-houston-interior.jpg', description: 'A rich, warm tone that brings a classic and inviting feel to any space.', tags: ['warm'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'ashen-vale', name: 'Ashen Vale', image: '/images/Products/ashen-vale/ashen-vale-european-oak-hardwood-floor-01.jpg', description: 'Soft gray tones with subtle weathered character for a serene, natural aesthetic.', tags: ['modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'mallorca', name: 'Mallorca', image: '/images/Products/mallorca/mallorca-european-oak-hardwood-floor-01.jpg', description: 'A clean, linen-white finish that brings Scandinavian simplicity to any room.', tags: ['light', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'bronze-grove', name: 'Bronze Grove', image: '/images/Products/bronze-grove/bronze-grove-european-oak-hardwood-floor.jpg', description: 'A sophisticated floor with gentle gray undertones for a modern yet rustic feel.', tags: ['modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'epernay', name: 'Épernay', image: '/images/Products/epernay/epernay-european-oak-hardwood-floor-01.jpg', description: 'Warm wheat tones reminiscent of golden canyon walls, perfect for cozy interiors.', tags: ['warm'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'seville', name: 'Seville', image: '/images/Products/seville/seville-european-oak-hardwood-floor-01.jpg', description: 'A sophisticated blend of cedar warmth with ash-gray undertones for timeless elegance.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'chestnut-vale', name: 'Chestnut Vale', image: '/images/Products/chestnut-vale/chestnut-vale-european-oak-hardwood-floor.jpg', description: 'Deep, robust browns give this floor a stately and luxurious character.', tags: ['dark'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'siena', name: 'Siena', image: '/images/Products/siena/siena-european-oak-hardwood-floor-01.jpg', description: 'Earthy clay tones that bring the warmth of the desert landscape indoors.', tags: ['warm'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'modena', name: 'Modena', image: '/images/Products/modena/modena-european-oak-hardwood-floor-01.jpg', description: 'Weathered gray-brown tones that capture the essence of seaside driftwood.', tags: ['modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'harbor-cloud', name: 'Harbor Cloud', image: '/images/Products/harbor-cloud/harbor-cloud-oak-flooring-in-houston-interior.jpg', description: 'Light and airy, this floor brightens rooms with its soft, contemporary look.', tags: ['light'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'perpignan', name: 'Perpignan', image: '/images/Products/perpignan/perpignan-european-oak-hardwood-floor-01.jpg', description: 'Gentle mist-gray tones that evoke peaceful harbor mornings.', tags: ['light', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'saint-tropez', name: 'Saint-Tropez', image: '/images/Products/saint-tropez/saint-tropez-european-oak-hardwood-floor-01.jpg', description: 'Classic oak character with rich heritage brown tones for traditional elegance.', tags: ['warm'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'ivory-coast', name: 'Ivory Coast', image: '/images/Products/ivory-coast/ivory-coast-european-oak-hardwood-floor-01.jpg', description: 'Pure ivory tones with coastal charm, perfect for bright, airy spaces.', tags: ['light'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'laguna-mist', name: 'Laguna Mist', image: '/images/Products/laguna-mist/laguna-mist-european-oak-hardwood-floor.jpg', description: 'Soft blue-gray undertones reminiscent of misty coastal lagoons.', tags: ['light', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'maple-haven', name: 'Maple Haven', image: '/images/Products/maple-haven/maple-haven-european-oak-hardwood-floor.jpg', description: 'Golden hues and a gentle grain pattern create a cozy, welcoming atmosphere.', tags: ['warm'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'portofino', name: 'Portofino', image: '/images/Products/portofino/portofino-european-oak-hardwood-floor-01.jpg', description: 'Rich bronze tones with natural meadow-inspired warmth.', tags: ['warm'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'marseille', name: 'Marseille', image: '/images/Products/marseille/marseille-european-oak-hardwood-floor-01.jpg', description: "Coastal beige tones that bring California's relaxed elegance indoors.", tags: ['light', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'nordic-smoke', name: 'Nordic Smoke', image: '/images/Products/nordic-smoke/nordic-smoke-european-oak-hardwood-floor-01.jpg', description: 'Sophisticated smoky gray tones with Scandinavian-inspired minimalism.', tags: ['modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'troy', name: 'Troy', image: '/images/Products/troy/troy-european-oak-hardwood-floor-01.jpg', description: 'Soft oyster tones with a subtle haze finish for coastal elegance.', tags: ['light', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'verona', name: 'Verona', image: '/images/Products/verona/verona-european-oak-hardwood-floor-01.jpg', description: 'Natural trail-worn character with Pacific coastal inspiration.', tags: ['modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'arles', name: 'Arles', image: '/images/Products/arles/arles-european-oak-hardwood-floor-01.jpg', description: 'Stone-gray tones reminiscent of weathered pebbles along mountain ridges.', tags: ['modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'valencia', name: 'Valencia', image: '/images/Products/valencia/valencia-european-oak-hardwood-floor-01.jpg', description: 'Smooth gray tones like polished riverstone for a tranquil, natural feel.', tags: ['modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'sandpoint-ivory', name: 'Sandpoint Ivory', image: '/images/Products/sandpoint-ivory/sandpoint-ivory-european-oak-hardwood-floor.jpg', description: 'A clean, neutral base that pairs beautifully with a wide range of decor styles.', tags: ['light', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'savanna-oak', name: 'Savanna Oak', image: '/images/Products/savanna-oak/savanna-oak-european-oak-hardwood-floor.jpg', description: 'Warm savanna tones that bring African grassland beauty to your home.', tags: ['warm'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'sorrento', name: 'Sorrento', image: '/images/Products/sorrento/sorrento-european-oak-hardwood-floor-01.jpg', description: 'Warm Mediterranean honey-brown tones that bring inviting elegance to everyday spaces.', tags: ['warm'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'beirut', name: 'Beirut', image: '/images/Products/beirut/beirut-european-oak-hardwood-floor-01.jpg', description: 'Balanced natural oak color with soft warmth for versatile, design-friendly interiors.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'ibiza', name: 'Ibiza', image: '/images/Products/ibiza/ibiza-european-oak-hardwood-floor-01.jpg', description: 'Light coastal oak tones that keep interiors bright, airy, and effortlessly modern.', tags: ['light', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'mykonos', name: 'Mykonos', image: '/images/Products/mykonos/mykonos-european-oak-hardwood-floor-01.jpg', description: 'Soft modern oak tones inspired by Mediterranean resort living and calm interiors.', tags: ['light', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'capri', name: 'Capri', image: '/images/Products/capri/capri-european-oak-hardwood-floor-01.jpg', description: 'Elegant neutral oak with a sunny, refined tone suited for classic and modern homes.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'izmir', name: 'Izmir', image: '/images/Products/izmir/izmir-european-oak-hardwood-floor-01.jpg', description: 'Warm contemporary oak with subtle depth, ideal for comfortable high-end interiors.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'cassis', name: 'Cassis', image: '/images/Products/cassis/cassis-european-oak-hardwood-floor-01.jpg', description: 'A warm natural oak tone with soft depth and timeless character for inviting interiors.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'doha', name: 'Doha', image: '/images/Products/doha/doha-european-oak-hardwood-floor-01.jpg', description: 'Rich contemporary oak with warm undertones and grounded elegance for high-end spaces.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'bruges', name: 'Bruges', image: '/images/Products/bruges/bruges-european-oak-hardwood-floor-01.jpg', description: 'A sophisticated medium oak color that blends warm comfort with clean contemporary design.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'dubai', name: 'Dubai', image: '/images/Products/dubai/dubai-european-oak-hardwood-floor-01.jpg', description: 'A bold warm oak statement with modern character, perfect for striking interior spaces.', tags: ['warm', 'dark'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'palermo', name: 'Palermo', image: '/images/Products/palermo/palermo-european-oak-hardwood-floor-01.jpg', description: 'Elegant warm oak tones with a refined, contemporary finish for versatile home design.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'ghent', name: 'Ghent', image: '/images/Products/ghent/ghent-european-oak-hardwood-floor-01.jpg', description: 'A warm neutral oak palette that delivers understated sophistication and everyday durability.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'biarritz', name: 'Biarritz', image: '/images/Products/biarritz/biarritz-european-oak-hardwood-floor-01.jpg', description: 'A refined medium-warm oak tone that adds depth and elegance to modern interiors.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'cannes', name: 'Cannes', image: '/images/Products/cannes/cannes-european-oak-hardwood-floor-01.jpg', description: 'A polished warm oak look with contemporary character and timeless versatility.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'menorca', name: 'Menorca', image: '/images/Products/menorca/menorca-european-oak-hardwood-floor-01.jpg', description: 'A warm natural oak floor that combines relaxed coastal influence with modern design.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'lucca', name: 'Lucca', image: '/images/Products/lucca/lucca-european-oak-hardwood-floor-01.jpg', description: 'A rich warm oak tone designed for timeless interiors and everyday elegance.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'bodrum', name: 'Bodrum', image: '/images/Products/bodrum/bodrum-european-oak-hardwood-floor-01.jpg', description: 'A bold warm oak expression with contemporary depth and natural European character.', tags: ['warm', 'dark'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'positano', name: 'Positano', image: '/images/Products/positano/positano-european-oak-hardwood-floor-01.jpg', description: 'Warm Mediterranean oak tones with refined texture for elegant contemporary homes.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'cappadocia', name: 'Cappadocia', image: '/images/Products/cappadocia/cappadocia-european-oak-hardwood-floor-01.jpg', description: 'A cleaner select-grade oak style with subtle warmth and refined modern appeal.', tags: ['light', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'antibes', name: 'Antibes', image: '/images/Products/antibes/antibes-european-oak-hardwood-floor-01.jpg', description: 'A select-grade warm neutral oak with clean visuals and smooth design flexibility.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'santorini', name: 'Santorini', image: '/images/Products/santorini/santorini-european-oak-hardwood-floor-01.jpg', description: 'A bright select-grade oak floor with airy tone and modern European sophistication.', tags: ['light', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'ravello', name: 'Ravello', image: '/images/Products/ravello/ravello-european-oak-hardwood-floor-01.jpg', description: 'An ABC-grade European oak with rich character and balanced contemporary warmth.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'deauville', name: 'Deauville', image: '/images/Products/deauville/deauville-european-oak-hardwood-floor-01.jpg', description: 'A premium select-grade oak in a lighter refined palette with substantial board thickness.', tags: ['light', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'korcula', name: 'Korcula', image: '/images/Products/korcula/korcula-european-oak-hardwood-floor-01.jpg', description: 'A character-grade European oak with balanced warmth and clean modern versatility.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'ragusa', name: 'Ragusa', image: '/images/Products/ragusa/ragusa-european-oak-hardwood-floor-01.jpg', description: 'A full-character ABCD European oak with authentic grain movement and bold personality.', tags: ['modern', 'dark'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'lecce', name: 'Lecce', image: '/images/Products/lecce/lecce-european-oak-hardwood-floor-01.jpg', description: 'A refined Character-grade European oak with balanced warmth and elegant contemporary flow.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'matera', name: 'Matera', image: '/images/Products/matera/matera-european-oak-hardwood-floor-01.jpg', description: 'A sophisticated Character-grade oak style with clean lines and natural European texture.', tags: ['modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'casablanca', name: 'Casablanca', image: '/images/Products/casablanca/casablanca-european-oak-hardwood-floor-01.jpg', description: 'A premium select-grade American Walnut with rich depth and smooth contemporary elegance.', tags: ['dark', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'savannah', name: 'Savannah', image: '/images/Products/savannah/savannah-european-oak-hardwood-floor-01.jpg', description: 'A select-grade American Oak with brushed texture and clean wide-plank modern appeal.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'charleston', name: 'Charleston', image: '/images/Products/charleston/charleston-european-oak-hardwood-floor-01.jpg', description: 'A select-grade brushed American Oak with elegant wide-plank balance and timeless flexibility.', tags: ['modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'montpellier', name: 'Montpellier', image: '/images/Products/montpellier/montpellier-european-oak-hardwood-floor-01.jpg', description: 'High-altitude cloud-white tones with mountain-inspired serenity.', tags: ['light'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'sierra-driftwood', name: 'Sierra Driftwood', image: '/images/Products/sierra-driftwood/sierra-driftwood-oak-flooring-in-houston-living-room.jpg', description: 'Mountain driftwood character with weathered gray-brown beauty.', tags: ['modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'silver-dune', name: 'Silver Dune', image: '/images/Products/silver-dune/silver-dune-european-oak-hardwood-floor.jpg', description: 'A pale, silvery-beige that offers a chic and minimalist foundation for any room.', tags: ['light', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'toledo', name: 'Toledo', image: '/images/Products/toledo/toledo-european-oak-hardwood-floor-01.jpg', description: 'Deep slate-gray tones reminiscent of rocky shorelines and coastal cliffs.', tags: ['dark', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'soleil-dune', name: 'Soleil Dune', image: '/images/Products/soleil-dune/soleil-dune-european-oak-hardwood-floor.jpg', description: 'Sun-kissed dune tones with French coastal elegance and warmth.', tags: ['warm'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'stone-pearl', name: 'Stone Pearl', image: '/images/Products/stone-pearl/stone-pearl-european-oak-hardwood-floor-01.jpg', description: 'Lustrous pearl-gray tones with stone-like depth and sophistication.', tags: ['light', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'cortona', name: 'Cortona', image: '/images/Products/cortona/cortona-european-oak-hardwood-floor-01.jpg', description: 'Rich olive and brown tones inspired by Tuscan countryside groves.', tags: ['warm'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'venetian-sand', name: 'Venetian Sand', image: '/images/Products/venetian-sand/venetian-sand-european-oak-hardwood-floor-01.jpg', description: 'Warm sand tones with Venetian sophistication and old-world charm.', tags: ['warm'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'willow-drift', name: 'Willow Drift', image: '/images/Products/willow-drift/willow-drift-european-oak-hardwood-floor-01.jpg', description: 'Soft willow-gray tones with gentle drifting character for peaceful spaces.', tags: ['light', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
  { id: 'woodland-ember', name: 'Woodland Ember', image: '/images/Products/woodland-ember/woodland-ember-european-oak-hardwood-floor.jpg', description: 'A medium brown with subtle warmth, perfect for a timeless, natural aesthetic.', tags: ['warm', 'modern'], widthLabel: null, widthValue: null, thicknessLabel: null, thicknessValue: null, wearLayerLabel: null, wearLayerValue: null },
];

const PRODUCTS: ProductWithTags[] = BASE_PRODUCTS.map((product) => {
  const productData = PRODUCTS_DATA[product.id];
  const boardSize = productData?.specs?.['Board Size'];
  const wearLayerRaw = productData?.specs?.['Wear Layer Thickness'] ?? productData?.specs?.['Wear Layer'];
  const widthInfo = parseWidthFromBoardSize(boardSize) ?? parseWidth(productData?.width);
  const thicknessInfo = parseThicknessFromBoardSize(boardSize) ?? parseThickness(productData?.thickness);
  const wearLayerInfo = parseWearLayer(wearLayerRaw);
  return {
    ...product,
    widthLabel: widthInfo?.label ?? null,
    widthValue: widthInfo?.value ?? null,
    thicknessLabel: thicknessInfo?.label ?? null,
    thicknessValue: thicknessInfo?.value ?? null,
    wearLayerLabel: wearLayerInfo?.label ?? null,
    wearLayerValue: wearLayerInfo?.value ?? null,
  };
});

const WIDTH_OPTIONS = Array.from(
  new Map(
    PRODUCTS
      .filter((product) => product.widthValue !== null && product.widthLabel !== null)
      .sort((a, b) => (a.widthValue ?? 0) - (b.widthValue ?? 0))
      .map((product) => [
        (product.widthValue as number).toFixed(3),
        { value: (product.widthValue as number).toFixed(3), label: product.widthLabel as string },
      ])
  ).values()
);

const THICKNESS_OPTIONS = Array.from(
  new Map(
    PRODUCTS
      .filter((product) => product.thicknessValue !== null && product.thicknessLabel !== null)
      .sort((a, b) => (a.thicknessValue ?? 0) - (b.thicknessValue ?? 0))
      .map((product) => [
        (product.thicknessValue as number).toFixed(4),
        { value: (product.thicknessValue as number).toFixed(4), label: product.thicknessLabel as string },
      ])
  ).values()
);

const WEAR_LAYER_OPTIONS = Array.from(
  new Map(
    PRODUCTS
      .filter((product) => product.wearLayerValue !== null && product.wearLayerLabel !== null)
      .sort((a, b) => (a.wearLayerValue ?? 0) - (b.wearLayerValue ?? 0))
      .map((product) => [
        (product.wearLayerValue as number).toFixed(3),
        { value: (product.wearLayerValue as number).toFixed(3), label: product.wearLayerLabel as string },
      ])
  ).values()
);

export function initProductCatalog(): void {
  const grid = document.getElementById('product-grid') as HTMLElement;
  const styleFilterSelect = document.getElementById('style-filter-select') as HTMLSelectElement | null;
  const widthFilterSelect = document.getElementById('width-filter-select') as HTMLSelectElement | null;
  const thicknessFilterSelect = document.getElementById('thickness-filter-select') as HTMLSelectElement | null;
  const wearFilterSelect = document.getElementById('wear-filter-select') as HTMLSelectElement | null;
  const filterResultsCount = document.getElementById('filter-results-count') as HTMLElement | null;
  const clearAllFilters = document.getElementById('clear-all-filters') as HTMLButtonElement | null;
  let activeFilter: string = 'all';
  let activeWidthFilter: string = 'all';
  let activeThicknessFilter: string = 'all';
  let activeWearFilter: string = 'all';

  function populateSelect(
    select: HTMLSelectElement | null,
    options: Array<{ value: string; label: string }>,
    allLabel: string,
    activeValue: string
  ): void {
    if (!select) return;

    const html = [`<option value="all">${allLabel}</option>`]
      .concat(options.map((option) => `<option value="${option.value}">${option.label}</option>`))
      .join('');

    select.innerHTML = html;
    select.value = activeValue;
  }

  function renderProducts(): void {
    if (!grid) return;

    const filteredProducts = PRODUCTS.filter((product) => {
      const matchesTone = activeFilter === 'all' || product.tags.includes(activeFilter);
      const matchesWidth = activeWidthFilter === 'all' || ((product.widthValue ?? -1).toFixed(3) === activeWidthFilter);
      const matchesThickness = activeThicknessFilter === 'all' || ((product.thicknessValue ?? -1).toFixed(4) === activeThicknessFilter);
      const matchesWear = activeWearFilter === 'all' || ((product.wearLayerValue ?? -1).toFixed(3) === activeWearFilter);
      return matchesTone && matchesWidth && matchesThickness && matchesWear;
    });

    grid.innerHTML = filteredProducts.map(p => `
      <article id="${p.id}" class="reveal group rounded-2xl bg-white p-4 shadow-soft flex flex-col h-full">
        <a href="/products/${p.id}" class="flex flex-col h-full">
          <div class="relative aspect-square overflow-hidden rounded-xl bg-brand-sand">
            <img src="${p.image}" alt="Houston home with ${p.name} European oak flooring" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy">
          </div>
          <div class="grow flex flex-col pt-4">
            <h3 class="font-semibold text-lg">${p.name}</h3>
            ${p.widthLabel ? `<p class="mt-1 text-xs text-brand-ink/60">Width: ${p.widthLabel}</p>` : ''}
            ${p.thicknessLabel ? `<p class="mt-1 text-xs text-brand-ink/60">Thickness: ${p.thicknessLabel}</p>` : ''}
            ${p.wearLayerLabel ? `<p class="mt-1 text-xs text-brand-ink/60">Wear Layer: ${p.wearLayerLabel}</p>` : ''}
            <p class="mt-2 text-sm text-brand-ink/70 grow">${p.description}</p>
            <div class="mt-4">
              <span class="w-full inline-flex items-center justify-center rounded-2xl bg-brand-brass px-4 py-2 text-white shadow-soft">View Product</span>
            </div>
          </div>
        </a>
      </article>
    `).join('');

    if (filterResultsCount) {
      if (filteredProducts.length === PRODUCTS.length) {
        filterResultsCount.textContent = 'Showing all products';
      } else {
        const label = filteredProducts.length === 1 ? 'product' : 'products';
        filterResultsCount.textContent = `${filteredProducts.length} ${label} found`;
      }
    }

    reanimate();
  }

  function resetAllFilters(): void {
    activeFilter = 'all';
    activeWidthFilter = 'all';
    activeThicknessFilter = 'all';
    activeWearFilter = 'all';

    if (styleFilterSelect) styleFilterSelect.value = 'all';
    if (widthFilterSelect) widthFilterSelect.value = 'all';
    if (thicknessFilterSelect) thicknessFilterSelect.value = 'all';
    if (wearFilterSelect) wearFilterSelect.value = 'all';

    renderProducts();
  }

  if (styleFilterSelect) {
    styleFilterSelect.addEventListener('change', () => {
      activeFilter = styleFilterSelect.value || 'all';
      renderProducts();
    });
  }

  if (widthFilterSelect) {
    widthFilterSelect.addEventListener('change', () => {
      activeWidthFilter = widthFilterSelect.value || 'all';
      renderProducts();
    });
  }

  if (thicknessFilterSelect) {
    thicknessFilterSelect.addEventListener('change', () => {
      activeThicknessFilter = thicknessFilterSelect.value || 'all';
      renderProducts();
    });
  }

  if (wearFilterSelect) {
    wearFilterSelect.addEventListener('change', () => {
      activeWearFilter = wearFilterSelect.value || 'all';
      renderProducts();
    });
  }

  if (clearAllFilters) {
    clearAllFilters.addEventListener('click', resetAllFilters);
  }

  // Re-initialize reveal animations for the new content
  const productIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { 
        e.target.classList.add('opacity-100', 'translate-y-0'); 
        productIO.unobserve(e.target); 
      }
    });
  }, { threshold: 0.15 });

  function reanimate(): void {
    document.querySelectorAll('.reveal').forEach(el => {
      if (!el.classList.contains('opacity-100')) {
        el.classList.add('opacity-0', 'translate-y-4', 'transition', 'duration-700', 'ease-smooth');
        productIO.observe(el);
      }
    });
  }

  populateSelect(widthFilterSelect, WIDTH_OPTIONS, 'All Widths', activeWidthFilter);
  populateSelect(thicknessFilterSelect, THICKNESS_OPTIONS, 'All Thicknesses', activeThicknessFilter);
  populateSelect(wearFilterSelect, WEAR_LAYER_OPTIONS, 'All Wear Layers', activeWearFilter);
  if (styleFilterSelect) styleFilterSelect.value = activeFilter;

  renderProducts();
}

