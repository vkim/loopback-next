import {
  DataObject,
  Entity,
  EntityCrudRepository,
  Getter,
  HasManyDefinition,
} from '../..';
import {
  createTargetConstraint,
  createThroughConstraint,
  resolveHasManyThroughMetadata,
} from './has-many-through.helpers';
import {
  DefaultHasManyThroughRepository,
  HasManyThroughRepository,
} from './has-many-through.repository';

export type HasManyThroughRepositoryFactory<
  TargetEntity extends Entity,
  TargetID,
  ThroughEntity extends Entity,
  ForeignKeyType
> = (
  fkValue: ForeignKeyType,
) => HasManyThroughRepository<TargetEntity, TargetID, ThroughEntity>;

export function createHasManyThroughRepositoryFactory<
  TargetEntity extends Entity,
  TargetID,
  ThroughEntity extends Entity,
  ThroughID,
  ForeignKeyType
>(
  relationMetadata: HasManyDefinition,
  targetRepositoryGetter: Getter<EntityCrudRepository<TargetEntity, TargetID>>,
  throughRepositoryGetter: Getter<
    EntityCrudRepository<ThroughEntity, ThroughID>
  >,
): HasManyThroughRepositoryFactory<
  TargetEntity,
  TargetID,
  ThroughEntity,
  ForeignKeyType
> {
  const meta = resolveHasManyThroughMetadata(relationMetadata);
  const result = function (fkValue: ForeignKeyType) {
    function getTargetContraint(
      throughInstances: ThroughEntity[],
    ): DataObject<TargetEntity> {
      return createTargetConstraint<TargetEntity, ThroughEntity>(
        meta,
        throughInstances,
      );
    }
    function getThroughConstraint(
      targetInstance?: TargetEntity,
    ): DataObject<ThroughEntity> {
      const constriant: DataObject<ThroughEntity> = createThroughConstraint<
        TargetEntity,
        ThroughEntity,
        ForeignKeyType
      >(meta, fkValue, targetInstance);
      return constriant;
    }

    return new DefaultHasManyThroughRepository<
      TargetEntity,
      TargetID,
      EntityCrudRepository<TargetEntity, TargetID>,
      ThroughEntity,
      ThroughID,
      EntityCrudRepository<ThroughEntity, ThroughID>
    >(
      targetRepositoryGetter,
      throughRepositoryGetter,
      getTargetContraint,
      getThroughConstraint,
    );
  };
  return result;
}
