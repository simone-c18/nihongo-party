import { React } from 'react';
import { useNavigate } from 'react-router-dom';


function Leaderboard({players, onContinue}) {
    const navigate = useNavigate();

    // Sample data 
    const samplePlayers = [
        {id: 1, name: 'name', points: 'points'},
        {id: 1, name: 'name', points: 'points'},
        {id: 1, name: 'name', points: 'points'},
        {id: 1, name: 'name', points: 'points'},
    ];

    // Sort players
    const rankedPlayers = players && players.length > 0
        ? [...players].sort((a, b) => b.points - a.points)
        : samplePlayers;

    const handleContinue = () => {
        if (onContinue) {
            onContinue();
        }else {
            navigate('/'); // update to name of next game
        }
    };

    return (
        <div className = "leaderboard_page">
            <div className = "leaderboard_wrapper">
                <h2 className = "leaderboard_title">Leaderboard</h2>

                
                <div className = "leaderboard_card">
                    <div className = "leaderboard_list">
                        {rankedPlayers.map((player, index)  => (
                            <div key = {player.id || index} className = "leaderboard_pill">
                                <span className = "rank_num">{index + 1}.</span>
                                <span className = "player_name">{player.name}</span>
                                <span className = "player_points">{player.points}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    type = "button" 
                    className = "button leaderboard_continue"
                    onClick = {handleContinue}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}

export default Leaderboard;