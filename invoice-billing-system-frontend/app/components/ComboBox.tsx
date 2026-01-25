import { useEffect, useState, useRef } from 'react';

interface Props<T> {
    value: string;
    placeholder?: string
    onChange: (value: string) => void;
    onSelect: (item: T) => void;
    isLoading?: boolean;
    options: T[];
    renderOption?: (item: T) => React.ReactNode;
    getOptionLabel?: (item: T) => string;
}

export function ComboBox<T>(props: Props<T>) {
    const [showDropDown, setShowDropDown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const getOptionLabel = props.getOptionLabel || ((option: T) => (option as any).name);

    const filteredOptions = props.options.filter(option =>
        getOptionLabel(option).toLowerCase().includes(props.value.toLowerCase())
    );

    function hanldeKeyDown(e: React.KeyboardEvent) {
        if (!showDropDown) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
                    props.onSelect(filteredOptions[selectedIndex]);
                    setShowDropDown(false);
                    setSelectedIndex(-1);
                }
                break;
            case 'Escape':
                setShowDropDown(false);
                break;
        }
    }

    let ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setShowDropDown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref}
            role="combobox"
            aria-expanded={showDropDown}>
            <div className="input-area">
                <input type="text"
                    placeholder={props.placeholder}
                    value={props.value}
                    onChange={(e) => props.onChange(e.target.value)}
                    onFocus={() => setShowDropDown(true)} 
                    onKeyDown={hanldeKeyDown}
                    aria-activedescendant={selectedIndex > -1 ? `option-${selectedIndex}` : undefined}/>
            </div>
            <ul className="dropdown-area" role="listbox">
                {showDropDown && (
                    props.isLoading ? <li className="dropdown-loading">Loading...</li> : (
                        filteredOptions.length === 0 ? <li className="dropdown-empty">No results found</li> : (
                            filteredOptions.map((item, index) => (
                                <li className="dropdown-option"
                                    id={`option-${index}`}
                                    key={index}
                                    role="option"
                                    aria-selected={selectedIndex === index}
                                    onClick={() => {
                                        props.onSelect(item);
                                        setShowDropDown(false);
                                    }}
                                >
                                    {props.renderOption ? props.renderOption(item) : getOptionLabel(item)}
                                </li>
                            ))
                        )
                    )
                )}
            </ul>
        </div>);
}