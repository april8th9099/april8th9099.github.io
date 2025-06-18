// JSPhone T30 Comparison App JavaScript

// Phone data
let phoneData = {};
let currentCompetitor = null;



// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    document.body.style.overflow = 'hidden'; // Prevent scrolling during loading
    setTimeout(() => {
        document.body.style.overflow = 'auto';
      }, 6000);
    console.log('DOM loaded, initializing app...');

    fetch('./app_data.json')
        .then(response => response.json())
        .then(data => {
            phoneData = data;
            initializeApp();
            setupAnimations();
        })
        .catch(error => {
            console.error('Error loading app data:', error);
        }
    );
});

/*
// Try to load external phone data
async function loadExternalData() {
    try {
        const response = await fetch('https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/c6a577d69e62e879ae787c9265b6dec4/17b9d28b-9172-4f77-9e92-d81b2caef989/2fe0df27.json');
        const externalData = await response.json();
        phoneData = externalData;
        console.log('External phone data loaded successfully');
        
        // Re-populate selector with new data
        populatePhoneSelector();
        if (phoneData.competitors.length > 0) {
            currentCompetitor = phoneData.competitors[0];
            document.getElementById('phone-selector').value = '0';
            updateAllComparisons();
        }
    } catch (error) {
        console.log('Using fallback phone data');
    }
}
*/

// Initialize the application
function initializeApp() {
    console.log('Initializing app...');
    populatePhoneSelector();
    setupPhoneSelector();
    
    const selectedModel = localStorage.getItem('selectedPhoneModel');
    if (selectedModel) {
        const index = phoneData.competitors.findIndex(p => p.model === selectedModel);
        if (index !== -1) {
            currentCompetitor = phoneData.competitors[index];
            document.getElementById('phone-selector').value = String(index);
            updateAllComparisons();
        }
    } else if (phoneData.competitors.length > 0) {
        currentCompetitor = phoneData.competitors[0];
        document.getElementById('phone-selector').value = '0';
        updateAllComparisons();
    }

    /*
    // Set default comparison to first competitor
    if (phoneData.competitors.length > 0) {
        currentCompetitor = phoneData.competitors[0];
        document.getElementById('phone-selector').value = '0';
        updateAllComparisons();
    }
    */
}

// Populate the phone selector dropdown
function populatePhoneSelector() {
    const selector = document.getElementById('phone-selector');
    
    // Clear existing options except the first one
    while (selector.children.length > 1) {
        selector.removeChild(selector.lastChild);
    }
    
    phoneData.competitors.forEach((phone, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${phone.brand} ${phone.model}`;
        selector.appendChild(option);
    });
    
    console.log('Phone selector populated with', phoneData.competitors.length, 'options');
}

// Setup phone selector event listener
function setupPhoneSelector() {
    const selector = document.getElementById('phone-selector');
    selector.addEventListener('change', function() {
        const selectedIndex = this.value;
        console.log('Phone selector changed to index:', selectedIndex);
        
        if (selectedIndex !== '' && phoneData.competitors[selectedIndex]) {
            currentCompetitor = phoneData.competitors[selectedIndex];
            updateAllComparisons();
            triggerComparisonAnimations();
        }
    });
}

// Update all comparison sections
function updateAllComparisons() {
    if (!currentCompetitor) {
        console.log('No competitor selected');
        return;
    }

    console.log('Updating all comparisons for:', currentCompetitor.model);
    
    updateCameraComparison();
    updateProcessorComparison();
    updateMemoryComparison();
    updateBatteryComparison();
    updateDisplayComparison();
    updateWeightComparison();
}

// Calculate percentage difference
function calculatePercentageDifference(jsphoneValue, competitorValue, higherIsBetter = true) {
    if (competitorValue === 0) return 0;
    
    if (higherIsBetter) {
        return Math.round(((jsphoneValue - competitorValue) / competitorValue) * 100);
    } else {
        // For weight, lower is better
        return Math.round(((competitorValue - jsphoneValue) / competitorValue) * 100);
    }
}

// Format number with commas
function formatNumber(num) {
    return num.toLocaleString();
}

// Update camera comparison
function updateCameraComparison() {
    const jsphone = phoneData.jsphone;
    const percentage = calculatePercentageDifference(jsphone.cameraScore, currentCompetitor.cameraScore);
    
    document.getElementById('camera-percentage').textContent = Math.abs(percentage);
    document.getElementById('camera-competitor-name').textContent = currentCompetitor.model;
    document.getElementById('camera-competitor-value').textContent = currentCompetitor.cameraScore;
    
    let statement;
    if (percentage > 0) {
        statement = `Our JSPhone T30 captures ${Math.abs(percentage)}% higher quality photos than the ${currentCompetitor.model}, delivering stunning clarity and detail in every shot.`;
    } else if (percentage < 0) {
        statement = `The ${currentCompetitor.model} has a ${Math.abs(percentage)}% higher camera score, but JSPhone T30 still delivers exceptional photo quality with advanced computational photography.`;
    } else {
        statement = `JSPhone T30 matches the ${currentCompetitor.model} in camera performance, delivering professional-grade photography capabilities.`;
    }
    
    document.getElementById('camera-statement').textContent = statement;
}

// Update processor comparison
function updateProcessorComparison() {
    const jsphone = phoneData.jsphone;
    const percentage = calculatePercentageDifference(jsphone.processorScore, currentCompetitor.processorScore);
    
    document.getElementById('processor-percentage').textContent = Math.abs(percentage);
    document.getElementById('processor-competitor-name').textContent = currentCompetitor.model;
    document.getElementById('processor-competitor-value').textContent = formatNumber(currentCompetitor.processorScore);
    
    let statement;
    if (percentage > 0) {
        statement = `JSPhone T30's processor delivers ${Math.abs(percentage)}% better performance than the ${currentCompetitor.model}, ensuring lightning-fast app launches and seamless multitasking.`;
    } else if (percentage < 0) {
        statement = `While the ${currentCompetitor.model} has a ${Math.abs(percentage)}% higher processor score, JSPhone T30 is optimized for efficient performance and excellent battery life.`;
    } else {
        statement = `JSPhone T30 matches the ${currentCompetitor.model} in processing power, delivering smooth performance for all your needs.`;
    }
    
    document.getElementById('processor-statement').textContent = statement;
}

// Update memory comparison
function updateMemoryComparison() {
    const jsphone = phoneData.jsphone;
    const ramPercentage = calculatePercentageDifference(jsphone.ramGB, currentCompetitor.ramGB);
    const storagePercentage = calculatePercentageDifference(jsphone.storageGB, currentCompetitor.storageGB);
    
    // Use the higher percentage for display
    const displayPercentage = Math.max(Math.abs(ramPercentage), Math.abs(storagePercentage));
    
    document.getElementById('memory-percentage').textContent = displayPercentage;
    document.getElementById('memory-competitor-name').textContent = currentCompetitor.model;
    document.getElementById('memory-competitor-ram').textContent = `${currentCompetitor.ramGB}GB`;
    document.getElementById('memory-competitor-storage').textContent = `${currentCompetitor.storageGB}GB`;
    
    let statement;
    if (ramPercentage > 0 && storagePercentage > 0) {
        statement = `With ${Math.abs(ramPercentage)}% more RAM and ${Math.abs(storagePercentage)}% more storage than the ${currentCompetitor.model}, JSPhone T30 handles intensive tasks effortlessly while storing all your memories.`;
    } else if (ramPercentage > 0) {
        statement = `JSPhone T30 provides ${Math.abs(ramPercentage)}% more RAM than the ${currentCompetitor.model}, enabling superior multitasking and app performance.`;
    } else if (storagePercentage > 0) {
        statement = `With ${Math.abs(storagePercentage)}% more storage than the ${currentCompetitor.model}, JSPhone T30 ensures you never run out of space for your photos, videos, and apps.`;
    } else {
        statement = `JSPhone T30 offers generous memory specifications that compete strongly with the ${currentCompetitor.model}, providing excellent performance and storage capacity.`;
    }
    
    document.getElementById('memory-statement').textContent = statement;
}

// Update battery comparison
function updateBatteryComparison() {
    const jsphone = phoneData.jsphone;
    const percentage = calculatePercentageDifference(jsphone.batteryMah, currentCompetitor.batteryMah);
    
    document.getElementById('battery-percentage').textContent = Math.abs(percentage);
    document.getElementById('battery-competitor-name').textContent = currentCompetitor.model;
    document.getElementById('battery-competitor-value').textContent = formatNumber(currentCompetitor.batteryMah);
    
    let statement;
    if (percentage > 0) {
        statement = `With a ${Math.abs(percentage)}% larger battery capacity than the ${currentCompetitor.model}, JSPhone T30 powers through your entire day and beyond.`;
    } else if (percentage < 0) {
        statement = `Though the ${currentCompetitor.model} has a ${Math.abs(percentage)}% larger battery, JSPhone T30's efficient power management ensures excellent all-day performance.`;
    } else {
        statement = `JSPhone T30 matches the ${currentCompetitor.model} in battery capacity, providing reliable all-day power.`;
    }
    
    document.getElementById('battery-statement').textContent = statement;
}

// Update display comparison
function updateDisplayComparison() {
    const jsphone = phoneData.jsphone;
    const percentage = calculatePercentageDifference(jsphone.displayInch, currentCompetitor.displayInch);
    
    document.getElementById('display-percentage').textContent = Math.abs(percentage);
    document.getElementById('display-competitor-name').textContent = currentCompetitor.model;
    document.getElementById('display-competitor-value').textContent = `${currentCompetitor.displayInch}"`;
    
    let statement;
    if (percentage > 0) {
        statement = `JSPhone T30's display is ${Math.abs(percentage)}% larger than the ${currentCompetitor.model}, providing an immersive viewing experience perfect for streaming, gaming, and productivity.`;
    } else if (percentage < 0) {
        statement = `While the ${currentCompetitor.model} has a ${Math.abs(percentage)}% larger display, JSPhone T30's screen delivers exceptional clarity and color accuracy in a perfectly balanced form factor.`;
    } else {
        statement = `JSPhone T30 matches the ${currentCompetitor.model} in display size, offering an optimal viewing experience.`;
    }
    
    document.getElementById('display-statement').textContent = statement;
}

// Update weight comparison
function updateWeightComparison() {
    const jsphone = phoneData.jsphone;
    const percentage = calculatePercentageDifference(jsphone.weightG, currentCompetitor.weightG, false); // Lower is better for weight
    
    document.getElementById('weight-percentage').textContent = Math.abs(percentage);
    document.getElementById('weight-competitor-name').textContent = currentCompetitor.model;
    document.getElementById('weight-competitor-value').textContent = `${currentCompetitor.weightG}g`;
    
    let statement;
    if (percentage > 0) {
        statement = `Weighing ${Math.abs(percentage)}% less than the ${currentCompetitor.model}, JSPhone T30 offers superior portability without compromising on features or battery life.`;
    } else if (percentage < 0) {
        statement = `Though the JSPhone T30 is ${Math.abs(percentage)}% heavier than the ${currentCompetitor.model}, it packs more features and a larger battery in a premium, durable design.`;
    } else {
        statement = `JSPhone T30 matches the ${currentCompetitor.model} in weight, providing the perfect balance of features and portability.`;
    }
    
    document.getElementById('weight-statement').textContent = statement;
}

// Setup GSAP animations
function setupAnimations() {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
        console.log('GSAP not loaded, skipping animations');
        return;
    }

    console.log('Setting up GSAP animations');
    
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Hero section animation
    gsap.from(".hero-title", {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: "power2.out"
    });

    gsap.from(".hero-subtitle", {
        duration: 1,
        y: 30,
        opacity: 0,
        delay: 0.2,
        ease: "power2.out"
    });

    gsap.from(".hero-specs", {
        duration: 1,
        y: 30,
        opacity: 0,
        delay: 0.4,
        ease: "power2.out"
    });

    gsap.from(".hero-cta", {
        duration: 1,
        y: 20,
        opacity: 0,
        delay: 0.6,
        ease: "power2.out"
    });

    // Phone selector animation
    gsap.from(".phone-selector-container", {
        duration: 1,
        x: 50,
        opacity: 0,
        delay: 1,
        ease: "power2.out"
    });

    // Setup comparison section animations
    setupComparisonAnimations();
}

// Setup comparison section animations
function setupComparisonAnimations() {
    if (typeof gsap === 'undefined') return;
    
    const sections = document.querySelectorAll('.comparison-section');
    sections.forEach((section, index) => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });

        const title = section.querySelector('.section-title');
        const percentage = section.querySelector('.percentage-display');
        const statement = section.querySelector('.comparison-statement');
        const cards = section.querySelectorAll('.spec-card');
        const divider = section.querySelector('.vs-divider');

        if (title) {
            tl.from(title, {
                duration: 0.8,
                y: 30,
                opacity: 0,
                ease: "power2.out"
            });
        }

        if (percentage) {
            tl.from(percentage, {
                duration: 0.8,
                scale: 0.8,
                opacity: 0,
                ease: "back.out(1.7)"
            }, "-=0.4");
        }

        if (statement) {
            tl.from(statement, {
                duration: 0.8,
                y: 20,
                opacity: 0,
                ease: "power2.out"
            }, "-=0.4");
        }

        if (cards.length > 0) {
            tl.from(cards, {
                duration: 0.8,
                y: 30,
                opacity: 0,
                stagger: 0.2,
                ease: "power2.out"
            }, "-=0.4");
        }

        if (divider) {
            tl.from(divider, {
                duration: 0.6,
                scale: 0,
                opacity: 0,
                ease: "back.out(1.7)"
            }, "-=0.6");
        }
    });

    // Parallax effect for percentage displays
    gsap.utils.toArray('.percentage-display').forEach(element => {
        gsap.to(element, {
            y: -20,
            ease: "none",
            scrollTrigger: {
                trigger: element,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });
    });
}

// Trigger animations for comparison content updates
function triggerComparisonAnimations() {
    if (typeof gsap === 'undefined') return;

    // Animate percentage displays
    gsap.utils.toArray('.percentage-display').forEach(element => {
        gsap.from(element, {
            duration: 0.5,
            scale: 1.1,
            ease: "back.out(1.7)"
        });
    });

    // Animate statements
    gsap.utils.toArray('.comparison-statement').forEach(element => {
        gsap.from(element, {
            duration: 0.6,
            y: 10,
            opacity: 0.5,
            ease: "power2.out"
        });
    });
}


// Load GLB models for each section
function loadComparisonModels() {
    const sections = ['jsphone', 'camera', 'processor', 'memory', 'battery', 'display'];
    sections.forEach(sectionId => {
        const container = document.getElementById(`${sectionId}-model-viewer`);
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.set(0, 1, 3);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(400, 400);
        if(sectionId === 'jsphone') {
            renderer.setSize(600, 600); // Larger size for JSPhone model
        }
        container.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 1));
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(2, 2, 2);
        scene.add(light);

        const loader = new GLTFLoader();
        loader.load(`./assets/${sectionId}.glb`, (gltf) => {
            const model = gltf.scene;
            scene.add(model);

            const box = new THREE.Box3().setFromObject(model);
            const size = new THREE.Vector3();
            box.getSize(size);
            const center = new THREE.Vector3();
            box.getCenter(center);

            let scale = 2.0 / size.x;
            if (sectionId === 'jsphone') scale *= 0.6; // Scale JSPhone model larger
            if (sectionId === 'camera') scale *= 1;
            if (sectionId === 'processor') scale *= 1;
            if (sectionId === 'memory') scale *= 1.8;
            if (sectionId === 'battery') scale *= 0.6;
            if (sectionId === 'display') scale *= 1.2;
            model.scale.setScalar(scale);

            model.position.sub(center);
            if (sectionId === 'jsphone') model.position.y += 1.0;
            if (sectionId === 'camera') model.position.y += 1.0;
            if (sectionId === 'processor') model.position.y += 6.5;
            if (sectionId === 'memory') {
                model.position.y += 2.5;
                model.position.x -= 2.0;
            }
            if (sectionId === 'battery') {
                model.position.y += 1;
                model.position.x += 0.5;
            }
            if (sectionId === 'display') model.position.y += 1.0;


            scene.add(model);

            const animate = () => {
                requestAnimationFrame(animate);
                model.rotation.y += 0.01;
                renderer.render(scene, camera);
            };
            animate();
        });
    });
}

document.addEventListener('DOMContentLoaded', loadComparisonModels);
