import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [beers, setBeers] = useState([]);
    const [ratings, setRatings] = useState({});

    useEffect(() => {
        const fetchBeers = async () => {
            try {
                const response = await fetch('/beers');
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                const data = await response.json();
                setBeers(data);
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        };

        fetchBeers();
    }, []);

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const ratingsData = {};
                for (const beer of beers) {
                    const response = await fetch(`/beers/${encodeURIComponent(beer.id)}/rating`);
                    if (response.ok) {
                        const rating = await response.json();
                        ratingsData[beer.id] = rating;
                    } else {
                        ratingsData[beer.id] = 0;
                    }
                }
                setRatings(ratingsData);
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        };

        if (beers.length > 0) {
            fetchRatings();
        }
    }, [beers]);

    const rateBeer = async (id, rating) => {
        try {
            const response = await fetch(`/beers/${encodeURIComponent(id)}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rating),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            // Update the rating after successful rating
             const updatedRating = await response.json();
            setRatings({ ...ratings, [id]: updatedRating });
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    return (
        <div>
            <h1>Beer Ratings</h1>
            <div className="beer-list">
                {beers.map(beer => (
                    <div key={beer.id} className="beer-box">
                        <img
                            src={beer.imageUrl}
                            alt={beer.name}
                            className="beer-image"
                        />
                        <h2>{beer.name}</h2>
                        <p>Style: {beer.style}</p>
                        <p>Current Rating: {ratings[beer.id] ? ratings[beer.id].toFixed(2) : 0}</p>
                        <button onClick={() => rateBeer(beer.id, 1)}>☆</button>
                        <button onClick={() => rateBeer(beer.id, 2)}>☆☆</button>
                        <button onClick={() => rateBeer(beer.id, 3)}>☆☆☆</button>
                        <button onClick={() => rateBeer(beer.id, 4)}>☆☆☆☆</button>
                        <button onClick={() => rateBeer(beer.id, 5)}>☆☆☆☆☆</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
