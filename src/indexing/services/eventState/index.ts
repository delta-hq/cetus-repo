import { getTypeOrmClient } from "../db";
import { EventStates } from "../db/models/eventStates";

// Function to check if an event state exists
export const getEventState = async (
  eventType: string
): Promise<EventStates | null> => {
  try {
    const clientOrm = await getTypeOrmClient();

    const eventStates = await clientOrm
      .getRepository(EventStates)
      .findOneBy({ eventType });

    return eventStates ? eventStates : null;
  } catch (err) {
    console.log("failed: getEventState");
    console.log({ eventType });
    throw err;
  }
};

// Function to find and update an event state or create a new one
export const findAndUpdateEventState = async (
  eventType: string,
  nextCursorTxDigest: string,
  nextCursorEventSeq: string
): Promise<EventStates> => {
  try {
    const clientOrm = await getTypeOrmClient();
    const eventState = (await getEventState(eventType)) ?? {};
    const updatedEvent = await clientOrm.getRepository(EventStates).save({
      ...eventState,
      eventType,
      nextCursorTxDigest,
      nextCursorEventSeq,
    });

    return updatedEvent;
  } catch (error) {
    console.log("failed: findAndUpdateEventState");
    console.log({ eventType, nextCursorTxDigest, nextCursorEventSeq });
    throw error;
  }
};
