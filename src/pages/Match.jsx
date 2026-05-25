import Navbar from "../components/Navbar";
import MatchRace from "../components/Multiplayer/MatchRace";

function Match() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page-bg">
      <div className="shrink-0">
        <Navbar />
      </div>
      <div className="min-h-0 flex-1">
        <MatchRace />
      </div>
    </div>
  );
}

export default Match;
