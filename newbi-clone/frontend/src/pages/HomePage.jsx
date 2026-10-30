import React from 'react';
import { Hero } from '../sections/Hero';
import { CreatorSection } from '../sections/CreatorSection';
import { BrandSection } from '../sections/BrandSection';
import { Services } from '../sections/Services';
import { HowItWorks } from '../sections/HowItWorks';
import { WhyNewbi } from '../sections/WhyNewbi';
import { FAQ } from '../sections/FAQ';
import { ContactForm } from '../sections/ContactForm';

export const HomePage = () => {
  return (
    <div className="flex flex-col">
      <Hero />
      <CreatorSection />
      <BrandSection />
      <Services />
      <HowItWorks />
      <WhyNewbi />
      <FAQ />
      <ContactForm />
    </div>
  );
};
