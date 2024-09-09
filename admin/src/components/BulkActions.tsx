import {Box, Button, Flex, Typography} from '@strapi/design-system';
import ConfirmationDialog from "./ConfirmationDialog";
import {useState} from "react";

const BulkActions = ({selectedRepos, bulkCreateAction, bulkDeleteAction}) => {
  const [dialogVisible, setDialogVisible] = useState(false);

  const reposWithoutProject = selectedRepos.filter((repo) => !repo.repositoryId);
  const reposWithProject = selectedRepos.filter((repo) => repo.repositoryId);

  const projectsToBeCreated = reposWithoutProject.length
  const projectsToBeDeleted = reposWithProject.length
  const repositoryIdsToDelete = reposWithProject.map((repo) => repo.repositoryId)

  return (
    <Box paddingBottom={4}>
      <Flex>
        <Typography>
          {`You have ${projectsToBeCreated} projects to generate and ${projectsToBeDeleted} projects to delete`}
        </Typography>
        {projectsToBeCreated > 0 && (
          <Box paddingLeft={2}>
            <Button size="S" variant="success-light" onClick={() => bulkCreateAction(reposWithoutProject)}>
              {`Create ${projectsToBeCreated} project(s)`}
            </Button>
          </Box>
        )}
        {projectsToBeDeleted > 0 && (
          <Box paddingLeft={2}>
            <Button size="S" variant="danger-light" onClick={() => setDialogVisible(true)}>
              {`Delete ${projectsToBeDeleted} project(s)`}
            </Button>
          </Box>
        )}
      </Flex>
      <ConfirmationDialog
        visible={dialogVisible}
        message={`Are you sure you want to delete these project(s)?`}
        onClose={() => setDialogVisible(false)}
        onConfirm={() => {
          bulkDeleteAction(repositoryIdsToDelete)
          setDialogVisible(false)
        }}
      />
    </Box>
  )
}

export default BulkActions
