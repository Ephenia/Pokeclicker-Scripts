// ==UserScript==
// @name          [Pokeclicker] Route & Dungeon Walker + Pokerus Walker
// @namespace     Pokeclicker Scripts
// @author        goldhaxx
// @description   Walks routes to reach 10,000 defeats per route, then picks the hardest route with >= 20 KO/s from your AutoClicker. Also includes Pokerus mode to walk routes checking for Pokemon that need Pokerus resistance. Now includes dungeon modes for both clears (500 per dungeon) and Pokerus checking, with Enhanced Auto Clicker integration.
// @license       MIT
// @version       0.4.0
// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         unsafeWindow
// @run-at        document-idle
// ==/UserScript==

(function () {
    const SCRIPT_KEY = 'route10kwalker';
    const STORAGE = {
      enabled: `${SCRIPT_KEY}:enabled`,
      lastTarget: `${SCRIPT_KEY}:lastTarget`,
      mode: `${SCRIPT_KEY}:mode`,
    };
    const TARGET_ROUTE_KILLS = 10000;
    const TARGET_DUNGEON_CLEARS = 500;
    const REQUIRE_RATE = 20; // Pokémon per second
    const LOOP_MS = 50; // Main loop interval in milliseconds - controls how often the Walker checks for route/dungeon changes and updates
    
    // Walker modes
    const MODES = {
      ROUTE_10K: 'route10k',
      POKERUS: 'pokerus',
      DUNGEON_KILLS: 'dungeon_kills',
      DUNGEON_POKERUS: 'dungeon_pokerus'
    };
  
    // --- Utilities ---
    const W = !App.isUsingClient ? unsafeWindow : window;
  
    function getKO(a) {
      // Try to read route kill stats like App.game.statistics.routeKills[region][route]()
      try {
        const rk = App.game.statistics.routeKills;
        const v = rk?.[a.region]?.[a.number];
        return typeof v === 'function' ? v() : 0;
      } catch {
        return 0;
      }
    }
  
    function canAccess(a) {
      try {
        return MapHelper.accessToRoute(a.number, a.region);
      } catch {
        return false;
      }
    }
  
    function moveTo(a) {
      try {
        if (App.game.gameState === GameConstants.GameState.town || App.game.gameState === GameConstants.GameState.fighting) {
          MapHelper.moveToRoute(a.number, a.region);
        }
      } catch (e) {
        console.warn('[Route10k] moveTo error', e);
      }
    }
  
    function regionUnlocked(region) {
      try {
        return region <= player.highestRegion();
      } catch {
        return false;
      }
    }
  
    function getAllAccessibleRoutes() {
      // Flatten all unlocked regions into a sorted list of route objects {region, number}
      const routes = [];
      const regions = Object.values(GameConstants.Region).filter((v) => Number.isInteger(v));
      for (const r of regions) {
        if (!regionUnlocked(r)) continue;
        const list = Routes.getRoutesByRegion?.(r) ?? [];
        for (const route of list) {
          const a = { region: r, number: route.number };
          if (canAccess(a)) routes.push(a);
        }
      }
      // Sort by (region asc, route number asc)
      routes.sort((a, b) => (a.region - b.region) || (a.number - b.number));
      return routes;
    }
  
    function getClickerParams() {
      // Try EnhancedAutoClicker if available, otherwise infer a sane default
      const tps = W.EnhancedAutoClicker?.ticksPerSecond ?? 20;
      const mult = W.EnhancedAutoClicker?.autoClickMultiplier ?? 1;
      return { tps, mult };
    }
  
    function currentClickDamage() {
      try {
        return App.game.party.calculateClickAttack(true);
      } catch {
        return 1;
      }
    }
  
    function routeHP(a) {
      // Use PokemonFactory.routeHealth + species HP skew like EnhancedAutoClicker does (simplified if needed)
      try {
        let base = PokemonFactory.routeHealth(a.number, a.region);
        const mons = [...new Set(Object.values(Routes.getRoute(a.region, a.number).pokemon).flat().flatMap(p => p.pokemon ?? p))];
        const hps = mons.map((p) => pokemonMap[p].base.hitpoints);
        if (!hps.length) return base;
        const avg = hps.reduce((s, x) => s + x, 0) / hps.length;
        const hi = hps.reduce((m, x) => Math.max(m, x), 0);
        return Math.round(base * (0.9 + (hi / avg) / 10));
      } catch {
        // Fallback
        return PokemonFactory.routeHealth?.(a.number, a.region) ?? 1;
      }
    }
  
    function estimateKOpsOnRoute(a) {
      const { tps, mult } = getClickerParams();
      const clickDmg = currentClickDamage();
      const hp = routeHP(a);
      if (hp <= 0 || clickDmg <= 0) return 0;
  
      const clicksPerEnemy = Math.max(1, Math.ceil(hp / clickDmg));
      // Enemy KO per second ≈ (ticks per second * multiplier) / clicks needed
      return (tps * mult) / clicksPerEnemy;
    }

    // --- Pokerus Functions ---
    
    function getRoutePokemon(a) {
      try {
        const routeData = Routes.getRoute(a.region, a.number);
        if (!routeData?.pokemon) return [];
        
        // Only get Encounters Pokemon, not Roamers
        // Encounters are the main Pokemon that appear on the route
        const encounters = routeData.pokemon.land || [];
        const mons = [...new Set(encounters.flatMap(p => p.pokemon ?? p))];
        return mons;
      } catch {
        return [];
      }
    }
    
    function checkRoutePokerusStatus(a) {
      try {
        const routeMons = getRoutePokemon(a);
        if (!routeMons.length) return { needsPokerus: false, total: 0, resistant: 0 };
        
        let total = 0;
        let resistant = 0;
        let needsPokerus = false;
        
        // Debug: log which Pokemon we're checking (only once per route)
        if (!a.debugLogged) {
          console.log(`[Route10k] Checking route ${a.region}-${a.number} for Encounters Pokemon:`, routeMons);
          a.debugLogged = true;
        }
        
        for (const monName of routeMons) {
          const pokemon = App.game.party.getPokemonByName(monName);
          if (pokemon) {
            total++;
            // Check if Pokemon has resistant Pokerus (value 3)
            if (pokemon.pokerus === GameConstants.Pokerus.Resistant) {
              resistant++;
            } else {
              needsPokerus = true;
            }
          }
        }
        
        return { needsPokerus, total, resistant };
      } catch (e) {
        console.warn('[Route10k] checkRoutePokerusStatus error', e);
        return { needsPokerus: false, total: 0, resistant: 0 };
      }
    }
    
    function findNextPokerusRoute(routes) {
      // Find the next route that has Pokemon needing Pokerus resistance
      for (const route of routes) {
        const status = checkRoutePokerusStatus(route);
        if (status.needsPokerus) {
          return route;
        }
      }
      return null; // All routes have resistant Pokemon
    }

    // --- Dungeon Functions ---
    
    function getAllAccessibleDungeons() {
      // Get all unlocked dungeons from all regions
      const dungeons = [];
      const regions = Object.values(GameConstants.Region).filter((v) => Number.isInteger(v));
      
      for (const region of regions) {
        if (!regionUnlocked(region)) continue;
        
        // Find dungeon towns in this region
        const dungeonTowns = Object.values(TownList).filter((town) => 
          town.region === region && 
          town.constructor.name === 'DungeonTown' && 
          town.dungeon != null
        );
        
        for (const town of dungeonTowns) {
          const dungeon = town.dungeon;
          if (canAccessDungeon(dungeon)) {
            dungeons.push({
              dungeon: dungeon,
              town: town,
              region: region
            });
          }
        }
      }
      
      // Sort by region, then by dungeon name
      dungeons.sort((a, b) => (a.region - b.region) || a.dungeon.name.localeCompare(b.dungeon.name));
      return dungeons;
    }
    
    function canAccessDungeon(dungeon) {
      try {
        return dungeon.isUnlocked() && 
               App.game.wallet.currencies[GameConstants.Currency.dungeonToken]() >= dungeon.tokenCost;
      } catch {
        return false;
      }
    }
    
    function getDungeonClears(dungeon) {
      try {
        const dungeonIndex = GameConstants.getDungeonIndex(dungeon.name);
        return App.game.statistics.dungeonsCleared[dungeonIndex]?.() ?? 0;
      } catch {
        return 0;
      }
    }
    
    function moveToDungeon(dungeonData) {
      try {
        if (App.game.gameState === GameConstants.GameState.town || 
            App.game.gameState === GameConstants.GameState.fighting ||
            App.game.gameState === GameConstants.GameState.dungeon) {
          
          // Move to the town first if not already there
          if (!MapHelper.isTownCurrentLocation(dungeonData.town.name)) {
            MapHelper.moveToTown(dungeonData.town.name);
          } else {
            // Already in the town, ensure Enhanced Auto Clicker Auto Dungeon is enabled
            if (W.EnhancedAutoClicker && typeof W.EnhancedAutoClicker.toggleAutoDungeon === 'function') {
              // Check if Auto Dungeon is not already running and enable it
              if (!W.EnhancedAutoClicker.autoDungeonState()) {
                console.log(`[Route10k] Activating Enhanced Auto Clicker Auto Dungeon for ${dungeonData.dungeon.name}`);
                W.EnhancedAutoClicker.toggleAutoDungeon();
              }
            } else {
              // Fallback: initialize the dungeon manually if Enhanced Auto Clicker not available
              DungeonRunner.initializeDungeon(dungeonData.dungeon);
            }
          }
        }
      } catch (e) {
        console.warn('[Route10k] moveToDungeon error', e);
      }
    }
    
    function getDungeonPokemon(dungeon) {
      try {
        const pokemon = [];
        
        // Get enemy list Pokemon
        if (dungeon.enemyList) {
          for (const enemy of dungeon.enemyList) {
            let pokemonName;
            if (typeof enemy === 'string') {
              pokemonName = enemy;
            } else if (typeof enemy.pokemon === 'string') {
              pokemonName = enemy.pokemon;
            }
            if (pokemonName && !pokemon.includes(pokemonName)) {
              pokemon.push(pokemonName);
            }
          }
        }
        
        // Get boss list Pokemon
        if (dungeon.bossList) {
          for (const boss of dungeon.bossList) {
            let pokemonName;
            if (boss.constructor && boss.constructor.name === 'DungeonBossPokemon') {
              pokemonName = boss.name;
            } else if (typeof boss === 'string') {
              pokemonName = boss;
            }
            if (pokemonName && !pokemon.includes(pokemonName)) {
              pokemon.push(pokemonName);
            }
          }
        }
        
        return pokemon;
      } catch {
        return [];
      }
    }
    
    function checkDungeonPokerusStatus(dungeonData) {
      try {
        const dungeonMons = getDungeonPokemon(dungeonData.dungeon);
        if (!dungeonMons.length) return { needsPokerus: false, total: 0, resistant: 0 };
        
        let total = 0;
        let resistant = 0;
        let needsPokerus = false;
        
        // Debug: log which Pokemon we're checking (only once per dungeon)
        if (!dungeonData.debugLogged) {
          console.log(`[Route10k] Checking dungeon ${dungeonData.dungeon.name} for Pokemon:`, dungeonMons);
          dungeonData.debugLogged = true;
        }
        
        for (const monName of dungeonMons) {
          const pokemon = App.game.party.getPokemonByName(monName);
          if (pokemon) {
            total++;
            // Check if Pokemon has resistant Pokerus (value 3)
            if (pokemon.pokerus === GameConstants.Pokerus.Resistant) {
              resistant++;
            } else {
              needsPokerus = true;
            }
          }
        }
        
        return { needsPokerus, total, resistant };
      } catch (e) {
        console.warn('[Route10k] checkDungeonPokerusStatus error', e);
        return { needsPokerus: false, total: 0, resistant: 0 };
      }
    }
    
    function findNextDungeonClears(dungeons) {
      // Find the next dungeon that needs more clears
      for (const dungeonData of dungeons) {
        const clears = getDungeonClears(dungeonData.dungeon);
        if (clears < TARGET_DUNGEON_CLEARS) {
          return dungeonData;
        }
      }
      return null; // All dungeons have enough clears
    }
    
    function findNextDungeonPokerus(dungeons) {
      // Find the next dungeon that has Pokemon needing Pokerus resistance
      for (const dungeonData of dungeons) {
        const status = checkDungeonPokerusStatus(dungeonData);
        if (status.needsPokerus) {
          return dungeonData;
        }
      }
      return null; // All dungeons have resistant Pokemon
    }
    
    function ensureAutoDungeonEnabled() {
      // Ensure Enhanced Auto Clicker Auto Dungeon is enabled for dungeon modes
      if (W.EnhancedAutoClicker && typeof W.EnhancedAutoClicker.toggleAutoDungeon === 'function') {
        if (!W.EnhancedAutoClicker.autoDungeonState()) {
          console.log('[Route10k] Enabling Enhanced Auto Clicker Auto Dungeon for dungeon mode');
          W.EnhancedAutoClicker.toggleAutoDungeon();
        }
      }
    }
    
    function ensureAutoDungeonDisabled() {
      // Disable Enhanced Auto Clicker Auto Dungeon when switching away from dungeon modes
      if (W.EnhancedAutoClicker && typeof W.EnhancedAutoClicker.toggleAutoDungeon === 'function') {
        if (W.EnhancedAutoClicker.autoDungeonState()) {
          console.log('[Route10k] Disabling Enhanced Auto Clicker Auto Dungeon for non-dungeon mode');
          W.EnhancedAutoClicker.toggleAutoDungeon();
        }
      }
    }
  
    // Optional: quick live probe to verify >= REQUIRE_RATE if EnhancedAutoClicker not present
    let probeState = null;
    function beginProbeVerify(a) {
      probeState = {
        route: a,
        startKills: App.game.statistics.totalPokemonDefeated?.() ?? 0,
        startTime: Date.now(),
      };
    }
    function probeRateReached() {
      if (!probeState) return false;
      const dt = Math.max(1, (Date.now() - probeState.startTime) / 1000);
      const cur = App.game.statistics.totalPokemonDefeated?.() ?? probeState.startKills;
      const rate = (cur - probeState.startKills) / dt;
      return rate >= REQUIRE_RATE && dt >= 2;
    }
    function clearProbe() { probeState = null; }
  
    function hardestMaintaining20(routes) {
      // Try from hardest to easiest until we find one that meets >= REQUIRE_RATE
      const desc = [...routes].sort((a, b) => (b.region - a.region) || (b.number - a.number));
      // Prefer static estimate; if no EAC present, optionally verify live only for the first match
      const hasEAC = !!W.EnhancedAutoClicker;
      for (const r of desc) {
        const kops = estimateKOpsOnRoute(r);
        if (kops >= REQUIRE_RATE) {
          if (hasEAC) return r;
          // No EAC: do a quick live probe to confirm for the chosen candidate
          return r;
        }
      }
      // If none meet the rate, return the easiest accessible (so we at least grind somewhere)
      return desc.at(-1) ?? null;
    }
  
    // --- Controller ---
    let enabled = (localStorage.getItem(STORAGE.enabled) ?? 'false') === 'true';
    let mode = localStorage.getItem(STORAGE.mode) ?? MODES.ROUTE_10K;
    let loopHandle = null;
    let currentTarget = null;
    
    function getModeDisplayText(mode) {
      switch (mode) {
        case MODES.POKERUS: return 'Pokerus';
        case MODES.DUNGEON_KILLS: return 'Dungeon - Clears';
        case MODES.DUNGEON_POKERUS: return 'Dungeon - PKRS';
        default: return '10k Kills';
      }
    }
  
    function pickNextTarget(routes) {
      if (mode === MODES.POKERUS) {
        return findNextPokerusRoute(routes);
      } else if (mode === MODES.DUNGEON_KILLS) {
        const dungeons = getAllAccessibleDungeons();
        return findNextDungeonClears(dungeons);
      } else if (mode === MODES.DUNGEON_POKERUS) {
        const dungeons = getAllAccessibleDungeons();
        return findNextDungeonPokerus(dungeons);
      } else {
        // Next route with < 10k kills
        for (const r of routes) {
          if (getKO(r) < TARGET_ROUTE_KILLS) return r;
        }
        return null;
      }
    }
  
    function mainLoop() {
      if (!enabled) return;
  
      // If we are in battleFrontier/safari/etc., just idle
      if ([GameConstants.GameState.safari, GameConstants.GameState.battleFrontier].includes(App.game.gameState)) {
        return;
      }
  
      const routes = getAllAccessibleRoutes();
      if (!routes.length) return;
  
      if (mode === MODES.POKERUS) {
        // Pokerus mode: find routes with Pokemon needing resistance
        const need = pickNextTarget(routes);
        if (need) {
          // If we changed target, move there
          if (!currentTarget || currentTarget.region !== need.region || currentTarget.number !== need.number) {
            currentTarget = need;
            localStorage.setItem(STORAGE.lastTarget, JSON.stringify(currentTarget));
            moveTo(currentTarget);
          } else {
            // Already on target — if we somehow drifted, move back
            if (player.region !== currentTarget.region || player.route !== currentTarget.number) {
              moveTo(currentTarget);
            }
          }
          return;
        } else {
          // All Pokemon on all routes are resistant
          console.log('[Route10k] All Pokemon on all routes have Pokerus resistance!');
          return;
        }
      } else if (mode === MODES.DUNGEON_KILLS) {
        // Dungeon clears mode: find dungeons needing more clears
        const need = pickNextTarget(routes);
        if (need) {
          // If we changed target, move there
          if (!currentTarget || currentTarget.dungeon.name !== need.dungeon.name) {
            currentTarget = need;
            localStorage.setItem(STORAGE.lastTarget, JSON.stringify(currentTarget));
            moveToDungeon(currentTarget);
          } else {
            // Already on target — if we somehow drifted, move back
            if (player.town?.name !== currentTarget.town.name) {
              moveToDungeon(currentTarget);
            }
          }
          return;
        } else {
          // All dungeons have enough clears
          console.log('[Route10k] All dungeons have reached the target clear count!');
          return;
        }
      } else if (mode === MODES.DUNGEON_POKERUS) {
        // Dungeon Pokerus mode: find dungeons with Pokemon needing resistance
        const need = pickNextTarget(routes);
        if (need) {
          // If we changed target, move there
          if (!currentTarget || currentTarget.dungeon.name !== need.dungeon.name) {
            currentTarget = need;
            localStorage.setItem(STORAGE.lastTarget, JSON.stringify(currentTarget));
            moveToDungeon(currentTarget);
          } else {
            // Already on target — if we somehow drifted, move back
            if (player.town?.name !== currentTarget.town.name) {
              moveToDungeon(currentTarget);
            }
          }
          return;
        } else {
          // All Pokemon in all dungeons are resistant
          console.log('[Route10k] All Pokemon in all dungeons have Pokerus resistance!');
          return;
        }
        
        // Continuous monitoring for dungeon Pokerus mode
        if (currentTarget && mode === MODES.DUNGEON_POKERUS) {
          // Check if current dungeon is complete (all Pokemon resistant)
          const currentStatus = checkDungeonPokerusStatus(currentTarget);
          if (!currentStatus.needsPokerus) {
            // Current dungeon is complete, find next dungeon
            console.log(`[Route10k] Dungeon ${currentTarget.dungeon.name} complete! All Pokemon are resistant.`);
            currentTarget = null;
            localStorage.removeItem(STORAGE.lastTarget);
          } else {
            // Log progress every 10 seconds (every 20 loops at 500ms interval)
            if (!currentTarget.progressLogTime || Date.now() - currentTarget.progressLogTime > 10000) {
              console.log(`[Route10k] Dungeon ${currentTarget.dungeon.name}: ${currentStatus.resistant}/${currentStatus.total} Pokemon resistant`);
              currentTarget.progressLogTime = Date.now();
            }
          }
        }
        
        return;
      } else {
        // Route 10k mode: original logic
        // Phase 1: Ensure every route hits 10,000 defeats
        const need = pickNextTarget(routes);
        if (need) {
          // If we changed target, move there
          if (!currentTarget || currentTarget.region !== need.region || currentTarget.number !== need.number) {
            currentTarget = need;
            localStorage.setItem(STORAGE.lastTarget, JSON.stringify(currentTarget));
            clearProbe();
            moveTo(currentTarget);
          } else {
            // Already on target — if we somehow drifted, move back
            if (player.region !== currentTarget.region || player.route !== currentTarget.number) {
              moveTo(currentTarget);
            }
          }
          return;
        }
  
        // Phase 2: All routes are at 10k — choose hardest route sustaining >= 20 KO/s
        const chosen = hardestMaintaining20(routes);
        if (chosen) {
          const changed = !currentTarget || currentTarget.region !== chosen.region || currentTarget.number !== chosen.number;
          if (changed) {
            currentTarget = chosen;
            localStorage.setItem(STORAGE.lastTarget, JSON.stringify(currentTarget));
            moveTo(currentTarget);
            // If we don't have EnhancedAutoClicker, do a short live probe to confirm we actually get >= 20/s
            if (!W.EnhancedAutoClicker) beginProbeVerify(currentTarget);
          } else if (!W.EnhancedAutoClicker && probeState && !probeRateReached()) {
            // If the probe shows we're not actually meeting the rate, step down one route and try again next tick
            const sortedHardToEasy = [...routes].sort((a, b) => (b.region - a.region) || (b.number - a.number));
            const idx = sortedHardToEasy.findIndex(r => r.region === currentTarget.region && r.number === currentTarget.number);
            const fallback = sortedHardToEasy[idx + 1] ?? sortedHardToEasy.at(-1);
            if (fallback && (fallback.region !== currentTarget.region || fallback.number !== currentTarget.number)) {
              currentTarget = fallback;
              localStorage.setItem(STORAGE.lastTarget, JSON.stringify(currentTarget));
              moveTo(currentTarget);
              beginProbeVerify(currentTarget);
            }
          }
        }
      }
    }
  
    // --- UI Wiring ---
    function addButton() {
      const battleView = document.getElementsByClassName('battle-view')[0] || document.body;
      if (!battleView || document.getElementById('route10kwalker-toggle')) return;
  
      // Create table structure similar to Enhanced Auto Clicker
      const elemWalker = document.createElement("table");
      elemWalker.innerHTML = `<tbody>
        <tr>
            <td style="display: flex; column-gap: 2px;">
                <div style="flex: auto;">
                    <button id="route10kwalker-toggle" class="btn btn-block btn-${enabled ? 'success' : 'danger'}" style="font-size: 8pt;">
                        Route Walker [${enabled ? 'ON' : 'OFF'}]
                    </button>
                </div>
                <div style="flex: initial; display: flex; flex-direction: column;">
                    <div id="route10kwalker-mode-dropdown" class="dropdown show">
                        <button type="button" class="text-left custom-select col-12 btn btn-dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="max-height:30px; display:flex; flex:1; align-items:center;">
                            <span id="route10kwalker-mode-text" style="font-size: 8pt;">${getModeDisplayText(mode)}</span>
                        </button>
                        <div id="route10kwalker-mode-dropdown-menu" class="border-secondary dropdown-menu col-12">
                            <div class="dropdown-item" value="${MODES.ROUTE_10K}">10k Kills</div>
                            <div class="dropdown-item" value="${MODES.POKERUS}">Pokerus</div>
                            <div class="dropdown-item" value="${MODES.DUNGEON_KILLS}">Dungeon - Clears</div>
                            <div class="dropdown-item" value="${MODES.DUNGEON_POKERUS}">Dungeon - PKRS</div>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
        </tbody>`;
  
      battleView.before(elemWalker);
  
      // Add event listeners
      document.getElementById('route10kwalker-toggle').addEventListener('click', () => {
        enabled = !enabled;
        localStorage.setItem(STORAGE.enabled, String(enabled));
        const btn = document.getElementById('route10kwalker-toggle');
        btn.classList.remove('btn-success', 'btn-danger');
        btn.classList.add(enabled ? 'btn-success' : 'btn-danger');
        btn.textContent = `Route Walker [${enabled ? 'ON' : 'OFF'}]`;
        
        // Handle Auto Dungeon enabling/disabling based on Walker state
        const isDungeonMode = (mode === MODES.DUNGEON_KILLS || mode === MODES.DUNGEON_POKERUS);
        
        if (enabled && !loopHandle) {
          loopHandle = setInterval(mainLoop, LOOP_MS);
          // Enable Auto Dungeon if Walker is enabled and in dungeon mode
          if (isDungeonMode) {
            ensureAutoDungeonEnabled();
          }
        } else if (!enabled && loopHandle) {
          clearInterval(loopHandle);
          loopHandle = null;
          // Disable Auto Dungeon if Walker is disabled and was in dungeon mode
          if (isDungeonMode) {
            ensureAutoDungeonDisabled();
          }
        }
      });
  
      // Add dropdown event listeners
      document.querySelectorAll('#route10kwalker-mode-dropdown-menu > div').forEach((elem) => {
        elem.addEventListener('click', () => {
          const newMode = elem.getAttribute('value');
          if (newMode !== mode) {
            const oldMode = mode;
            mode = newMode;
            localStorage.setItem(STORAGE.mode, mode);
            document.getElementById('route10kwalker-mode-text').textContent = getModeDisplayText(mode);
            
            // Handle Auto Dungeon enabling/disabling based on mode changes
            const isDungeonMode = (mode === MODES.DUNGEON_KILLS || mode === MODES.DUNGEON_POKERUS);
            const wasDungeonMode = (oldMode === MODES.DUNGEON_KILLS || oldMode === MODES.DUNGEON_POKERUS);
            
            if (isDungeonMode && !wasDungeonMode) {
              // Switching to dungeon mode - enable Auto Dungeon
              ensureAutoDungeonEnabled();
            } else if (!isDungeonMode && wasDungeonMode) {
              // Switching away from dungeon mode - disable Auto Dungeon
              ensureAutoDungeonDisabled();
            }
            
            // Reset current target when switching modes
            currentTarget = null;
            localStorage.removeItem(STORAGE.lastTarget);
          }
        });
      });
      
      // Add CSS styling for the dropdown
      const style = document.createElement('style');
      style.textContent = `
        #route10kwalker-mode-dropdown-menu .dropdown-item {
          padding: 0.25rem 0.5rem;
          font-size: 8pt;
          cursor: pointer;
        }
        #route10kwalker-mode-dropdown-menu .dropdown-item:hover {
          background-color: #f8f9fa;
        }
      `;
      document.head.appendChild(style);
    }
  
    function bootstrap() {
      try {
        addButton();
        if (enabled && !loopHandle) loopHandle = setInterval(mainLoop, LOOP_MS);

        // Restore last target (optional; harmless if no longer accessible)
        try {
          const saved = localStorage.getItem(STORAGE.lastTarget);
          if (saved) currentTarget = JSON.parse(saved);
        } catch { /* ignore */ }
        
        // Ensure Auto Dungeon is enabled if Walker is enabled and in dungeon mode
        if (enabled && (mode === MODES.DUNGEON_KILLS || mode === MODES.DUNGEON_POKERUS)) {
          ensureAutoDungeonEnabled();
        }
      } catch (e) {
        console.error('[Route10k] init error', e);
        Notifier?.notify?.({
          type: NotificationConstants.NotificationOption.warning,
          title: 'Route Walker',
          message: 'The Route Walker failed to initialize.',
          timeout: GameConstants.SECOND * 10,
        });
      }
    }
  
    // Load with the same pattern as your other scripts so it initializes after the game is ready
    function loadCompat(scriptName, initFn) {
      function reportScriptError(name, error) {
        console.error(`Error while initializing '${name}' userscript:\n${error}`);
        Notifier?.notify?.({
          type: NotificationConstants.NotificationOption.warning,
          title: name,
          message: `The '${name}' userscript crashed while loading. Check for updates or disable the script, then restart the game.\n\nReport script issues to the script developer, not to the Pokéclicker team.`,
          timeout: GameConstants.DAY,
        });
      }
      if (W.epheniaScriptInitializers === undefined) {
        W.epheniaScriptInitializers = {};
        const oldInit = Preload.hideSplashScreen;
        let hasInitialized = false;
        Preload.hideSplashScreen = function (...args) {
          const res = oldInit.apply(this, args);
          if (App.game && !hasInitialized) {
            Object.entries(W.epheniaScriptInitializers).forEach(([name, fn]) => {
              try { fn(); } catch (e) { reportScriptError(name, e); }
            });
            hasInitialized = true;
          }
          return res;
        };
      }
      if (W.epheniaScriptInitializers[scriptName] !== undefined) {
        console.warn(`Duplicate '${scriptName}' userscripts found!`);
        Notifier?.notify?.({
          type: NotificationConstants.NotificationOption.warning,
          title: scriptName,
          message: `Duplicate '${scriptName}' userscripts detected. This could cause unpredictable behavior and is not recommended.`,
          timeout: GameConstants.DAY,
        });
        let n = 2;
        while (W.epheniaScriptInitializers[`${scriptName} ${n}`] !== undefined) n++;
        scriptName = `${scriptName} ${n}`;
      }
      W.epheniaScriptInitializers[scriptName] = initFn;
    }
  
    loadCompat('route10kwalker', bootstrap);
  })();