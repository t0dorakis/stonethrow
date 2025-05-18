/**
 *  based on https://github.com/robinloeffel/sgnls
 */
type SignalType<T> = ReturnType<typeof signal<T>>;
/** function that gets executed when a signal changes */
type Effect<T> = (value: T) => void;
/** function that manipulates the value of a signal */
type Updater<T> = (oldValue: T) => T;
interface Signal<T> {
    /** return the current value of the signal */
    get: () => T;
    /** override the value of the signal */
    set: (newValue: T) => void;
    /** manipulate the value of the signal */
    update: (updater: Updater<T>) => void;
    /** add an effect to the signal */
    effect: (effectToAdd: Effect<T>) => void;
    /** remove all effects from the signal */
    stop: VoidFunction;
}
declare const signal: <SignalType_1>(initialValue: SignalType_1) => Signal<SignalType_1>;

export { Signal as S, SignalType as a, signal as s };
