'use client';

import { useEffect, useMemo } from 'react';
import HeroSection from '@/components/website/HeroSection';
import MainCurationSection from '@/components/website/MainCurationSection';
import CategoryShortcut from '@/components/website/CategoryShortcut';
import CuratedCollections from '@/components/website/CuratedCollections';
import BrandStory from '@/components/website/BrandStory';
import BestProducts from '@/components/website/BestProducts';
import { useProductStore } from '@/store/productStore';
import { getProducts } from '@/lib/api/productApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

function mapToCard(p) {
  return {
    id: p.id,
    name: p.name,
    image: p.images?.[0]?.url ?? '',
    brand: p.brand,
    price: p.basePrice ?? 0,
  };
}

export default function IvyStorePage() {
  const { list, loading, error, setList, setLoading, setError } = useProductStore();

  useEffect(() => {
    setLoading(true);
    getProducts({ brand: 'IVY' })
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [setList, setLoading, setError]);

  const mainProducts = useMemo(() => list.slice(0, 6).map(mapToCard), [list]);
  const bestProducts = useMemo(() => list.slice(0, 4).map(mapToCard), [list]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col">
      {error && <ErrorMessage message={error} className="mx-4 mt-4" />}
      <HeroSection brand="ivy" />
      <MainCurationSection products={mainProducts} title="메인 추천" />
      <CategoryShortcut />
      <CuratedCollections />
      <BrandStory brand="ivy" />
      <BestProducts products={bestProducts} title="베스트 상품" />
    </div>
  );
}
