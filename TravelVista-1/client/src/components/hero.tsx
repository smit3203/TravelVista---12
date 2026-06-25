import SearchTabs from "./search-tabs";

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center text-white pt-16">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')`
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fadeInUp">
          Discover Your Next Adventure
        </h1>
        <p className="text-xl md:text-2xl mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          Book flights, hotels, and travel packages worldwide
        </p>
        
        <div className="animate-fadeInUp" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <SearchTabs />
        </div>
      </div>
    </section>
  );
};

export default Hero;
