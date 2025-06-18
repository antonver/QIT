const getProfile= () => {
    const profileData = {
        name: "John Doe",
        title: "Æon Architect C7",
        photo: "https://example.com/avatar.jpg",
        characteristics: {
            consciousnessLevel: "C7 (Architect)",
            energeticVector: "87% Will",
            thinkingType: "Analyst + Intuit",
            dominantArchetype: "Explorer",
            motivation: "Intrinsic",
        },
        performanceIndicators: {
            ritualsCompleted: "3 out of 44",
            consciousActions: "12",
            engagementDegree: "76%",
            vectorOfDevelopment: "Deepening (2 hours ago)",
        },
        overview: [
            "Path of Consciousness test passed",
            "NFT-relic 'Architect Glyph' obtained",
            "Genesis Access module unlocked",
        ],
    };
    return profileData;
}
export default getProfile;