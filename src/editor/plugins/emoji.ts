/**
 * Emoji plugin for the editor
 */

import {Plugin, PluginKey, EditorState, Transaction} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Node as ProseMirrorNode} from 'prosemirror-model';
import {Base} from './base';
import {Dropdown} from '../components/dropdown';
import type {Editor} from '../types';

/**
 * Type for command functions used in keymap
 */
type CommandFunction = (
    state: EditorState,
    dispatch: ((tr: Transaction) => void) | undefined,
    view: EditorView | undefined
) => boolean;

/**
 * Interface for a state-like object with just a doc property
 */
interface StateWithDoc {
    doc: ProseMirrorNode;
}

/**
 * Plugin key for the emoji plugin
 */
const emojiPluginKey = new PluginKey('emoji');

/**
 * Common emojis with their codes
 */
const EMOJIS: { [key: string]: string } = {
    // Text-based shortcuts (full format)
    ':smile:': '😊',
    ':sad:': '😢',
    ':grin:': '😃',
    ':tongue:': '😛',
    ':wink:': '😉',
    ':surprised:': '😮',
    ':shocked:': '😲',
    ':confused:': '😕',
    ':neutral:': '😐',
    ':happy:': '😄',
    ':dizzy:': '😵',

    // Smileys & Emotion
    ':joy:': '😂',
    ':heart_eyes:': '😍',
    ':blush:': '😊',
    ':kissing_heart:': '😘',
    ':relaxed:': '☺️',
    ':satisfied:': '😆',
    ':grinning:': '😁',
    ':stuck_out_tongue_winking_eye:': '😜',
    ':stuck_out_tongue:': '😛',
    ':flushed:': '😳',
    ':relieved:': '😌',
    ':unamused:': '😒',
    ':disappointed:': '😞',
    ':pensive:': '😔',
    ':confounded:': '😖',
    ':tired_face:': '😫',
    ':weary:': '😩',
    ':triumph:': '😤',
    ':rage:': '😡',
    ':sleepy:': '😪',
    ':yum:': '😋',
    ':mask:': '😷',
    ':sunglasses:': '😎',
    ':dizzy_face:': '😵',
    ':astonished:': '😲',
    ':worried:': '😟',
    ':frowning:': '😦',
    ':anguished:': '😧',
    ':smiling_imp:': '😈',
    ':imp:': '👿',
    ':open_mouth:': '😮',
    ':grimacing:': '😬',
    ':neutral_face:': '😐',
    ':hushed:': '😯',
    ':sleeping:': '😴',

    // People & Body
    ':thumbsup:': '👍',
    ':thumbsdown:': '👎',
    ':ok_hand:': '👌',
    ':fist:': '✊',
    ':v:': '✌️',
    ':hand:': '✋',
    ':open_hands:': '👐',
    ':muscle:': '💪',
    ':pray:': '🙏',
    ':point_up:': '☝️',
    ':point_down:': '👇',
    ':point_left:': '👈',
    ':point_right:': '👉',
    ':raised_hand:': '🙋',
    ':raised_hands:': '🙌',
    ':person_facepalming:': '🤦',
    ':person_shrugging:': '🤷',
    ':clap:': '👏',
    ':wave:': '👋',

    // Animals & Nature
    ':dog:': '🐶',
    ':cat:': '🐱',
    ':mouse:': '🐭',
    ':hamster:': '🐹',
    ':rabbit:': '🐰',
    ':bear:': '🐻',
    ':panda_face:': '🐼',
    ':koala:': '🐨',
    ':tiger:': '🐯',
    ':lion_face:': '🦁',
    ':cow:': '🐮',
    ':pig:': '🐷',
    ':pig_nose:': '🐽',
    ':frog:': '🐸',
    ':monkey_face:': '🐵',
    ':see_no_evil:': '🙈',
    ':hear_no_evil:': '🙉',
    ':speak_no_evil:': '🙊',
    ':monkey:': '🐒',
    ':chicken:': '🐔',
    ':penguin:': '🐧',
    ':bird:': '🐦',
    ':baby_chick:': '🐤',
    ':snake:': '🐍',
    ':turtle:': '🐢',
    ':bug:': '🐛',
    ':bee:': '🐝',
    ':ant:': '🐜',
    ':beetle:': '🐞',
    ':snail:': '🐌',
    ':octopus:': '🐙',
    ':shell:': '🐚',
    ':tropical_fish:': '🐠',
    ':fish:': '🐟',
    ':whale:': '🐳',
    ':dolphin:': '🐬',
    ':whale2:': '🐋',
    ':shark:': '🦈',

    // Food & Drink
    ':apple:': '🍎',
    ':green_apple:': '🍏',
    ':orange:': '🍊',
    ':lemon:': '🍋',
    ':banana:': '🍌',
    ':watermelon:': '🍉',
    ':grapes:': '🍇',
    ':strawberry:': '🍓',
    ':melon:': '🍈',
    ':cherries:': '🍒',
    ':peach:': '🍑',
    ':pineapple:': '🍍',
    ':tomato:': '🍅',
    ':eggplant:': '🍆',
    ':hot_pepper:': '🌶️',
    ':corn:': '🌽',
    ':sweet_potato:': '🍠',
    ':honey_pot:': '🍯',
    ':bread:': '🍞',
    ':cheese:': '🧀',
    ':poultry_leg:': '🍗',
    ':meat_on_bone:': '🍖',
    ':fried_shrimp:': '🍤',
    ':egg:': '🥚',
    ':hamburger:': '🍔',
    ':fries:': '🍟',
    ':hotdog:': '🌭',
    ':pizza:': '🍕',
    ':spaghetti:': '🍝',
    ':taco:': '🌮',
    ':burrito:': '🌯',
    ':ramen:': '🍜',
    ':stew: ': '🍲',
    ':fish_cake:': '🍥',
    ':sushi:': '🍣',
    ':bento:': '🍱',
    ':curry:': '🍛',
    ':rice_ball:': '🍙',
    ':rice:': '🍚',
    ':rice_cracker:': '🍘',
    ':oden:': '🍢',
    ':dango:': '🍡',
    ':shaved_ice:': '🍧',
    ':ice_cream:': '🍨',
    ':icecream:': '🍦',
    ':cake:': '🍰',
    ':birthday:': '🎂',
    ':custard:': '🍮',
    ':candy:': '🍬',
    ':lollipop:': '🍭',
    ':chocolate_bar:': '🍫',
    ':popcorn:': '🍿',
    ':doughnut:': '🍩',
    ':cookie:': '🍪',

    // Travel & Places
    ':rocket:': '🚀',
    ':airplane:': '✈️',
    ':car:': '🚗',
    ':taxi:': '🚕',
    ':bus:': '🚌',
    ':train:': '🚆',
    ':bike:': '🚲',
    ':ship:': '🚢',
    ':anchor:': '⚓',
    ':construction:': '🚧',
    ':fuelpump:': '⛽',
    ':busstop:': '🚏',
    ':vertical_traffic_light:': '🚦',
    ':traffic_light:': '🚥',
    ':checkered_flag:': '🏁',
    ':house:': '🏠',
    ':house_with_garden:': '🏡',
    ':school:': '🏫',
    ':office:': '🏢',
    ':hospital:': '🏥',
    ':bank:': '🏦',
    ':convenience_store:': '🏪',
    ':love_hotel:': '🏩',
    ':hotel:': '🏨',
    ':wedding:': '💒',
    ':church:': '⛪',
    ':department_store:': '🏬',
    ':post_office:': '🏣',
    ':city_sunrise:': '🌇',
    ':city_sunset:': '🌆',
    ':japanese_castle:': '🏯',
    ':european_castle:': '🏰',
    ':tent:': '⛺',
    ':factory:': '🏭',
    ':tokyo_tower:': '🗼',
    ':japan:': '🗾',
    ':mount_fuji:': '🗻',
    ':sunrise_over_mountains:': '🌄',
    ':sunrise:': '🌅',
    ':stars:': '🌠',
    ':statue_of_liberty:': '🗽',
    ':bridge_at_night:': '🌉',
    ':carousel_horse:': '🎠',
    ':rainbow:': '🌈',
    ':ferris_wheel:': '🎡',
    ':fountain:': '⛲',
    ':roller_coaster:': '🎢',

    // Activities
    ':soccer:': '⚽',
    ':basketball:': '🏀',
    ':football:': '🏈',
    ':baseball:': '⚾',
    ':tennis:': '🎾',
    ':volleyball:': '🏐',
    ':rugby_football:': '🏉',
    ':golf:': '⛳',
    ':mountain_bicyclist:': '🚵',
    ':bicyclist:': '🚴',
    ':horse_racing:': '🏇',
    ':snowboarder:': '🏂',
    ':swimmer:': '🏊',
    ':surfer:': '🏄',
    ':ski:': '🎿',
    ':spades:': '♠️',
    ':hearts:': '♥️',
    ':clubs:': '♣️',
    ':diamonds:': '♦️',
    ':gem:': '💎',
    ':ring_activity:': '💍',
    ':trophy:': '🏆',
    ':musical_score:': '🎼',
    ':musical_note:': '🎵',
    ':notes:': '🎶',
    ':studio_microphone:': '🎙️',
    ':level_slider:': '🎚️',
    ':control_knobs:': '🎛️',
    ':microphone:': '🎤',
    ':headphones:': '🎧',
    ':radio:': '📻',
    ':saxophone:': '🎷',
    ':guitar:': '🎸',
    ':musical_keyboard:': '🎹',
    ':trumpet:': '🎺',
    ':violin:': '🎻',
    ':drums:': '🥁',
    ':clapper:': '🎬',
    ':bow_and_arrow:': '🏹',

    // Objects
    ':coffee:': '☕',
    ':tea:': '🍵',
    ':sake:': '🍶',
    ':baby_bottle:': '🍼',
    ':beer:': '🍺',
    ':beers:': '🍻',
    ':cocktail:': '🍸',
    ':tropical_drink:': '🍹',
    ':wine_glass:': '🍷',
    ':fork_and_knife:': '🍴',
    ':chestnut:': '🌰',
    ':seedling:': '🌱',
    ':evergreen_tree:': '🌲',
    ':deciduous_tree:': '🌳',
    ':palm_tree:': '🌴',
    ':cactus:': '🌵',
    ':tulip:': '🌷',
    ':cherry_blossom:': '🌸',
    ':rose:': '🌹',
    ':hibiscus:': '🌺',
    ':sunflower:': '🌻',
    ':blossom:': '🌼',

    // Symbols
    ':heart:': '❤️',
    ':yellow_heart:': '💛',
    ':green_heart:': '💚',
    ':blue_heart:': '💙',
    ':purple_heart:': '💜',
    ':broken_heart:': '💔',
    ':heart_decoration:': '💟',
    ':two_hearts:': '💕',
    ':revolving_hearts:': '💞',
    ':heartbeat:': '💓',
    ':heartpulse:': '💗',
    ':sparkling_heart:': '💖',
    ':cupid:': '💘',
    ':gift_heart:': '💝',
    ':kiss:': '💋',
    ':ring:': '💍',
    ':bust_in_silhouette:': '👤',
    ':busts_in_silhouette:': '👥',
    ':speech_balloon:': '💬',
    ':footprints:': '👣',
    ':100:': '💯',
    ':fire:': '🔥',
    ':boom:': '💥',
    ':star:': '⭐',
    ':star2:': '🌟',
    ':sparkles:': '✨',
    ':zap:': '⚡',
    ':snowflake:': '❄️',
    ':cloud:': '☁️',
    ':sunny:': '☀️',
    ':umbrella:': '☔',
    ':snowman:': '⛄',
    ':cyclone:': '🌀',
    ':ocean:': '🌊'
};

/**
 * Emoji dropdown state
 */
interface EmojiDropdownState {
    active: boolean;
    filter: string;
    selectedIndex: number;
    from: number;
    to: number;
}

/**
 * Plugin that adds emoji support with Discord-like dropdown
 */
export class Emoji extends Base {
    /**
     * The name of the plugin
     */
    name = 'emoji';

    /**
     * The ProseMirror plugin instance
     */
    private plugin: Plugin;

    /**
     * Keymap for emoji navigation
     */
    get keymap(): Record<string, CommandFunction> {
        return {
            'ArrowDown': (_state, _dispatch, _view) => {
                if (!this.dropdownState.active) return false;

                const filteredEmojis = this.getFilteredEmojis();
                this.dropdownState.selectedIndex = Math.min(
                    this.dropdownState.selectedIndex + 1,
                    filteredEmojis.length - 1
                );
                this.updateDropdown();
                return true;
            },
            'ArrowUp': (_state, _dispatch, _view) => {
                if (!this.dropdownState.active) return false;

                this.dropdownState.selectedIndex = Math.max(
                    this.dropdownState.selectedIndex - 1,
                    0
                );
                this.updateDropdown();
                return true;
            },
            'Enter': (_state, _dispatch, view) => {
                if (!this.dropdownState.active) return false;

                const filteredEmojis = this.getFilteredEmojis();
                if (filteredEmojis.length === 0) return false;

                this.insertSelectedEmoji(view);
                return true;
            },
            'Escape': (_state, _dispatch, _view) => {
                if (!this.dropdownState.active) return false;

                this.hideDropdown();
                return true;
            },
            'Tab': (_state, _dispatch, view) => {
                if (!this.dropdownState.active) return false;

                const filteredEmojis = this.getFilteredEmojis();
                if (filteredEmojis.length === 0) return false;

                this.insertSelectedEmoji(view);
                return true;
            }
        };
    }

    /**
     * Dropdown instance
     */
    private dropdown?: Dropdown;

    /**
     * Current dropdown state
     */
    private dropdownState: EmojiDropdownState = {
        active: false,
        filter: '',
        selectedIndex: 0,
        from: 0,
        to: 0
    };


    /**
     * Click outside handler reference
     */
    private closeOnClickOutside?: (event: MouseEvent) => void;


    /**
     * Check the word at caret position and update dropdown accordingly
     * @param state The editor state or state-like object with doc
     * @param pos The current caret position
     * @param view The editor view
     * @returns Whether the dropdown visibility changed
     */
    private checkWordAndUpdateDropdown(state: EditorState | StateWithDoc, pos: number, view?: EditorView): boolean {
        // Find the word boundaries and word at the current position
        const {from, to, word} = this.findWordBoundaries(state, pos);

        // Check if the word starts with a colon
        if (word.startsWith(':') && word.length > 1) {
            const newFilter = word.slice(1); // Remove the colon

            // If the filter contains a space or invalid characters, hide the dropdown
            if (newFilter.includes(' ') || /[^a-zA-Z0-9_-]/.test(newFilter)) {
                this.hideDropdown();
                return false;
            }

            if (!this.dropdownState.active) {
                // If dropdown is not active, activate it
                this.dropdownState = {
                    active: true,
                    filter: newFilter,
                    selectedIndex: 0,
                    from: from + 1, // Position after the colon
                    to: to
                };

                // Show the dropdown
                if (view) {
                    setTimeout(() => {
                        this.showDropdown(view);
                    }, 0);
                }
            } else {
                // If dropdown is already active, update the filter and boundaries
                this.dropdownState.filter = newFilter;
                this.dropdownState.from = from + 1; // Position after the colon
                this.dropdownState.to = to;
                this.dropdownState.selectedIndex = 0; // Reset selection

                // Update the dropdown
                setTimeout(() => {
                    this.updateDropdown();
                }, 0);
            }

            return true;
        } else {
            // If the word doesn't start with a colon, hide the dropdown
            if (this.dropdownState.active) {
                this.hideDropdown();
                return true;
            }
        }

        return false;
    }

    /**
     * Constructor
     */
    constructor() {
        super();
        this.plugin = this.createPlugin();
    }

    /**
     * Create the ProseMirror plugin
     */
    private createPlugin(): Plugin {
        const self = this;
        return new Plugin({
            key: emojiPluginKey,
            state: {
                init() {
                    return null;
                },
                apply(tr, prev) {
                    // Run word check when selection changes
                    if (tr.selectionSet) {
                        const pos = tr.selection.from;
                        const view = self.getCurrentView();

                        if (view) {
                            // Use a timeout to ensure the view state is updated
                            setTimeout(() => {
                                self.checkWordAndUpdateDropdown(view.state, pos, view);
                            }, 0);
                        }
                    }

                    // Check if document changes affect the dropdown
                    if (tr.docChanged && self.dropdownState.active) {
                        const view = self.getCurrentView();

                        if (view) {
                            // Use a timeout to ensure the view state is updated
                            setTimeout(() => {
                                const pos = tr.selection.from;
                                self.checkWordAndUpdateDropdown(view.state, pos, view);
                            }, 0);
                        }
                    }

                    return prev;
                }

            },
            props: {
                handleTextInput: (view, from, to, text) => {
                    return this.handleTextInput(view, from, to, text);
                }
            }
        });
    }

    /**
     * Handle text input
     */
    private handleTextInput(view: EditorView, from: number, to: number, text: string): boolean {

        const {state} = view;

        // Check if the text is a colon and we're completing a potential emoji code
        if (text === ':') {
            // Check if this is the end of a potential emoji code
            const {from: wordFrom, word} = this.findWordBoundaries(state, from);
            const potentialEmojiCode = word + ':';

            // Check if the potential emoji code is a valid emoji
            if (EMOJIS[potentialEmojiCode]) {
                const emoji = EMOJIS[potentialEmojiCode];

                // Replace the emoji code with the actual emoji
                const tr = state.tr.insertText(
                    emoji,
                    wordFrom,
                    from + 1 // +1 to include the colon we're about to insert
                );

                view.dispatch(tr);
                view.focus();
                return true; // Prevent the character from being inserted normally
            }

            // Check if this starts an emoji sequence
            const textBefore = state.doc.textBetween(Math.max(0, from - 10), from);

            // Only trigger if the colon is at the start of a word or after whitespace
            if (from === 0 || /\s$/.test(textBefore) || textBefore === '') {
                // Use the unified function to check word and update dropdown
                // We need to wait for the colon to be inserted before checking
                setTimeout(() => {
                    const updatedState = view.state;
                    this.checkWordAndUpdateDropdown(updatedState, from + 1, view);
                }, 0);
            } else {
                // Hide dropdown if colon is not at the start of a word or after whitespace
                // this.hideDropdown();
            }
            return false;
        }

        if (this.dropdownState.active) {
            // Use the unified function to check word and update dropdown
            // This will handle showing/hiding the dropdown based on the current word
            this.checkWordAndUpdateDropdown(state, to, view);

            // If the dropdown is still active after the check, we need to handle emoji insertion
            if (!this.dropdownState.active) {
                return false;
            }

            // Check if the current filter matches an emoji exactly (including the closing colon)
            const fullEmojiKey = `:${this.dropdownState.filter}:`;
            if (EMOJIS[fullEmojiKey]) {
                const emoji = EMOJIS[fullEmojiKey];

                // Find the word boundaries
                const {from, to} = this.findWordBoundaries(state, this.dropdownState.from - 1);

                // Replace the entire word with the emoji
                const tr = state.tr.insertText(
                    emoji,
                    from,
                    to
                );

                view.dispatch(tr);
                this.hideDropdown();
                view.focus();
                return true; // Prevent the character from being inserted normally
            }

            setTimeout(() => {
                this.updateDropdown();
            }, 0);
        }

        return false;
    }

    /**
     * Get filtered emojis based on current filter
     */
    private getFilteredEmojis(): Array<{ name: string; emoji: string }> {
        const filter = this.dropdownState.filter.toLowerCase();
        return Object.entries(EMOJIS)
            .filter(([name]) => {
                const lowerName = name.toLowerCase();
                // Remove colons from the emoji name for comparison
                const nameWithoutColons = lowerName.slice(1, -1); // Remove first and last character (:)
                // Match if the filter is at the start of the emoji name (without colons)
                return nameWithoutColons.startsWith(filter);
            })
            .map(([name, emoji]) => ({name, emoji}))
            .slice(0, 10); // Limit to 10 results
    }

    /**
     * Show the emoji dropdown
     */
    private showDropdown(view: EditorView): void {
        if (this.dropdown) {
            this.hideDropdown();
        }

        // Create a dummy reference element for the dropdown
        // We'll position it manually based on cursor position
        const dummyRef = document.createElement('div');

        // Create the dropdown instance
        this.dropdown = new Dropdown({
            reference: dummyRef,
            className: 'flowmd-editor__emoji-dropdown',
            editorView: view,
            position: this.dropdownState.from,
            offset: [0, 5],
            closeOnClickOutside: true,
            onHide: () => {
                // When dropdown is hidden, update state
                if (this.closeOnClickOutside) {
                    document.removeEventListener('click', this.closeOnClickOutside);
                    this.closeOnClickOutside = undefined;
                }
            }
        });

        // Update the dropdown content
        this.updateDropdown();

        // Show the dropdown
        this.dropdown.show();
    }

    /**
     * Update dropdown content
     */
    private updateDropdown(): void {
        if (!this.dropdown) return;

        const filteredEmojis = this.getFilteredEmojis();

        if (filteredEmojis.length === 0) {
            this.dropdown.setContent('<div class="no-results">No emojis found</div>');
            // Hide dropdown when no matches are found
            setTimeout(() => this.hideDropdown(), 0);
            return;
        }

        const content = filteredEmojis
            .map((item, index) => {
                const isSelected = index === this.dropdownState.selectedIndex;
                return `
          <div 
            class="flowmd-editor__emoji-dropdown__item ${isSelected ? 'flowmd-editor__emoji-dropdown__item--selected' : ''}" 
            data-index="${index}"
          >
            <span class="flowmd-editor__emoji-dropdown__icon">${item.emoji}</span>
            <span class="flowmd-editor__emoji-dropdown__name">${item.name}</span>
          </div>
        `;
            })
            .join('');

        // Set the dropdown content
        this.dropdown.setContent(content);

        // Get the dropdown element to add click handlers
        const dropdownElement = this.dropdown.getElement();

        // Add click handlers
        dropdownElement.querySelectorAll('.flowmd-editor__emoji-dropdown__item').forEach((item, index) => {
            // Prevent mousedown from causing blur
            item.addEventListener('mousedown', (event) => {
                event.preventDefault();
            });

            item.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.dropdownState.selectedIndex = index;
                const currentView = this.getCurrentView();
                if (!currentView) return;
                this.insertSelectedEmoji(currentView);
                this.hideDropdown();
            });
        });
    }

    /**
     * Find word boundaries based on current position
     * @returns Object containing from, to positions and the word text
     */
    private findWordBoundaries(state: EditorState | StateWithDoc, pos: number): {
        from: number,
        to: number,
        word: string
    } {
        const doc = state.doc;

        // Get the resolved position to check if we're at a valid text position
        const $pos = doc.resolve(pos);

        // If we're not in a text node, return empty
        if (!$pos.parent.isTextblock) {
            return {from: pos, to: pos, word: ''};
        }

        // Get the text content of the current text block
        const textContent = $pos.parent.textContent;
        const posInParent = pos - $pos.start();

        // Find word boundaries within the text block
        let wordStart = posInParent;
        let wordEnd = posInParent;

        // Move backwards to find the start of the word
        while (wordStart > 0) {
            const char = textContent[wordStart - 1];
            if (!char || /[\s\n\r\t]/.test(char)) {
                break;
            }
            wordStart--;
        }

        // Move forwards to find the end of the word
        while (wordEnd < textContent.length) {
            const char = textContent[wordEnd];
            if (!char || /[\s\n\r\t]/.test(char)) {
                break;
            }
            wordEnd++;
        }

        // Convert back to document positions
        const docWordStart = $pos.start() + wordStart;
        const docWordEnd = $pos.start() + wordEnd;

        // Extract the word
        const word = textContent.substring(wordStart, wordEnd);

        return {
            from: docWordStart,
            to: docWordEnd,
            word
        };
    }

    /**
     * Insert the selected emoji
     */
    /**
     * Insert the selected emoji
     */
    private insertSelectedEmoji(view?: EditorView): void {
        const filteredEmojis = this.getFilteredEmojis();
        const selectedEmoji = filteredEmojis[this.dropdownState.selectedIndex];

        if (!selectedEmoji) return;

        const editorView = view || this.getCurrentView();
        if (!editorView) return;

        const {state, dispatch} = editorView;
        const {from} = this.dropdownState;

        // Find the word boundaries
        const {from: wordFrom, to: wordTo} = this.findWordBoundaries(state, from - 1);

        // Replace the entire word with the emoji
        const tr = state.tr.insertText(
            selectedEmoji.emoji,
            wordFrom,
            wordTo
        );

        dispatch(tr);
        this.hideDropdown();

        // Focus the editor after insertion
        setTimeout(() => {
            editorView.focus();
        }, 0);
    }

    /**
     * Hide the dropdown
     */
    private hideDropdown(): void {
        if (!this.dropdown) return;

        // Hide and destroy the dropdown
        this.dropdown.hide();
        this.dropdown.destroy();

        // Reset dropdown state
        this.dropdown = undefined;
        this.dropdownState.active = false;

        // Remove any existing click outside listeners
        if (this.closeOnClickOutside) {
            document.removeEventListener('click', this.closeOnClickOutside);
            this.closeOnClickOutside = undefined;
        }
    }

    /**
     * Get current editor view (helper method)
     */
    private getCurrentView(): EditorView | null {
        return (window as any).currentEditorView || null;
    }

    /**
     * Handle paste events - called by the editor
     * @param data Paste event data
     * @returns true if the paste was handled, false otherwise, or modified data for chaining
     */
    onPaste(data: { text: string; html: string; view: EditorView }): boolean | { text: string; html: string; view: EditorView } {
        const { text } = data;

        // Check if the pasted text contains any emoji shortcodes
        const hasEmojiShortcodes = Object.keys(EMOJIS).some(shortcode => text.includes(shortcode));

        if (!hasEmojiShortcodes) return false;

        // Replace all emoji shortcodes with actual emojis
        let newText = text;
        let textChanged = false;

        Object.entries(EMOJIS).forEach(([shortcode, emoji]) => {
            if (newText.includes(shortcode)) {
                newText = newText.replace(new RegExp(this.escapeRegExp(shortcode), 'g'), emoji);
                textChanged = true;
            }
        });

        // Only return modified data if the text actually changed
        if (textChanged && newText !== text) {
            return {
                text: newText,
                html: data.html,
                view: data.view
            };
        }

        return false;
    }

    /**
     * Get the ProseMirror plugin
     */
    getPlugin(): Plugin {
        return this.plugin;
    }

    /**
     * Initialize the plugin
     * @param editor The editor instance
     */
    init(editor: Editor): void {
        // Store the view globally for access in event handlers
        (window as any).currentEditorView = editor.view;

        // Add blur event listener to hide dropdown when editor loses focus
        editor.view.dom.addEventListener('blur', () => {
            this.hideDropdown();
        });

        // Parse existing content for emoji shortcodes when the editor is initialized
        this.parseExistingEmojis(editor);
    }

    /**
     * Parse existing content and convert emoji shortcodes to emojis
     */
    private parseExistingEmojis(editor: Editor): void {
        const {state, dispatch} = editor.view;
        let tr = state.tr;
        let hasChanges = false;

        // Walk through the document and find text nodes with emoji shortcodes
        state.doc.descendants((node, pos) => {
            if (node.isText && node.text) {
                const text = node.text;

                // Check if the text contains any emoji shortcodes
                const hasEmojiShortcodes = Object.keys(EMOJIS).some(shortcode => text.includes(shortcode));

                if (hasEmojiShortcodes) {
                    let newText = text;
                    let textChanged = false;

                    // Replace all emoji shortcodes with actual emojis
                    Object.entries(EMOJIS).forEach(([shortcode, emoji]) => {
                        if (newText.includes(shortcode)) {
                            newText = newText.replace(new RegExp(this.escapeRegExp(shortcode), 'g'), emoji);
                            textChanged = true;
                        }
                    });

                    // Only apply changes if the text actually changed
                    if (textChanged && newText !== text) {
                        // Replace the text node with the new text containing emojis
                        tr = tr.deleteRange(pos, pos + node.nodeSize);
                        tr = tr.insertText(newText, pos);
                        hasChanges = true;
                    }
                }
            }
            return true;
        });

        // Apply changes if any were made
        if (hasChanges) {
            dispatch(tr);
        }
    }

    /**
     * Escape special regex characters in a string
     */
    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
