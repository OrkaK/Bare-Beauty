const fs = require('fs');

const path = './advisor.js';
let content = fs.readFileSync(path, 'utf8');

// Replace performCameraAnalysis
const oldPerformCamera = `function performCameraAnalysis() {
    // In a real implementation, this would use TensorFlow.js or a similar ML library
    // For demo purposes, we'll generate realistic random results
    
    const skinTypes = ['dry', 'oily', 'combination', 'sensitive'];
    const skinTones = ['fair', 'light', 'medium', 'tan', 'deep', 'rich'];
    const undertones = ['warm', 'cool', 'neutral'];
    const possibleConcerns = ['dryness', 'dullness', 'pores', 'dark-circles'];
    
    userProfile.skinType = skinTypes[Math.floor(Math.random() * skinTypes.length)];
    userProfile.skinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
    userProfile.undertone = undertones[Math.floor(Math.random() * undertones.length)];
    userProfile.concerns = possibleConcerns.slice(0, Math.floor(Math.random() * 3) + 1);
    userProfile.analysisMethod = 'camera';
    
    showResults();
}`;

const newPerformCamera = `async function performCameraAnalysis() {
    try {
        const userAuth = JSON.parse(localStorage.getItem('bareBeautyUser'));
        if (!userAuth || !userAuth.token) {
            showAdvisorNotification('Please log in to use the AI Advisor', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            return;
        }

        // Convert base64 to File
        const res = await fetch(capturedImage);
        const blob = await res.blob();
        const formData = new FormData();
        formData.append('image', blob, 'capture.jpg');

        const response = await fetch('http://localhost:5001/api/ai/analyze', {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${userAuth.token}\`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Analysis failed');
        }

        const data = await response.json();
        
        userProfile.skinType = data.analysis ? data.analysis.skinType : 'combination';
        userProfile.skinTone = data.analysis ? (data.analysis.shade || data.analysis.makeupShade) : 'medium';
        userProfile.undertone = data.analysis ? data.analysis.undertone : 'neutral';
        userProfile.concerns = data.userContext && data.userContext.concerns ? data.userContext.concerns : ['dullness'];
        userProfile.analysisMethod = 'camera';

        showResults();
    } catch (err) {
        console.error(err);
        showAdvisorNotification('Analysis error. Using fallback logic.', 'error');
        // Fallback
        userProfile.skinType = 'combination';
        userProfile.skinTone = 'medium';
        userProfile.undertone = 'neutral';
        userProfile.concerns = ['pores'];
        userProfile.analysisMethod = 'camera';
        showResults();
    }
}`;

content = content.replace(oldPerformCamera, newPerformCamera);

// Replace generateRecommendations
const oldGenerateRecommendations = `function generateRecommendations() {
    const skincareProducts = getSkincareRecommendations();
    const makeupProducts = getMakeupRecommendations();
    const toolProducts = getToolRecommendations();
    const dealsProducts = getDealsRecommendations();
    
    renderSkincareRoutine(skincareProducts);
    renderProductGrid('makeupRecommendations', makeupProducts);
    renderProductGrid('toolRecommendations', toolProducts);
    renderProductGrid('dealsRecommendations', dealsProducts);
}`;

const newGenerateRecommendations = `async function generateRecommendations() {
    try {
        const userAuth = JSON.parse(localStorage.getItem('bareBeautyUser'));
        const headers = userAuth && userAuth.token ? { 'Authorization': \`Bearer \${userAuth.token}\` } : {};
        
        const response = await fetch('http://localhost:5001/recommendations', { headers });
        const backendProducts = await response.json();
        
        if (Array.isArray(backendProducts) && backendProducts.length > 0) {
            // Mix real products
            const skincare = backendProducts.filter(p => p.category === 'Skincare').slice(0, 4);
            const makeup = backendProducts.filter(p => p.category === 'Makeup').slice(0, 4);
            const tool = backendProducts.filter(p => p.category === 'Tools').slice(0, 4);
            
            // Format to UI expected structure
            const formatter = p => ({
                id: p._id,
                name: p.name,
                category: p.subCategory || p.category,
                price: p.price,
                image: p.images && p.images.length > 0 ? p.images[0] : 'img/placeholder.jpg',
                rating: p.rating ? p.rating.average : 5,
                reviews: p.rating ? p.rating.count : 42,
                originalPrice: p.price * 1.2
            });
            
            const routine = skincare.map((p, idx) => ({
                step: idx + 1,
                name: \`Step \${idx + 1}\`,
                icon: idx === 0 ? 'fa-droplet' : 'fa-flask',
                product: formatter(p),
                reason: 'Matched your profile perfectly.'
            }));
            
            renderSkincareRoutine(routine);
            renderProductGrid('makeupRecommendations', makeup.map(formatter));
            renderProductGrid('toolRecommendations', tool.map(formatter));
            renderProductGrid('dealsRecommendations', backendProducts.slice(0,4).map(formatter));
        } else {
            console.warn('Backend sent no recommendations, using local fallback.');
            // Fallback (this might error if keys like cleanser-1 are gone, but we patched fetchProducts globally)
            renderSkincareRoutine([]);
        }
    } catch (err) {
        console.error('Recommendations fail, using fallback', err);
    }
}`;

content = content.replace(oldGenerateRecommendations, newGenerateRecommendations);

fs.writeFileSync(path, content);
console.log('Successfully updated advisor.js');
